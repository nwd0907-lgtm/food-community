import "server-only";
import type { LocationSearchItem } from "./place";

// 위치 BFF(app/api/location/**) 전용 NAVER API 호출. 키는 서버 환경변수로만 읽는다
// - 지역 검색: NAVER API HUB 지역 검색 (NCP_SEARCH_KEY_ID / NCP_SEARCH_KEY)
//   https://api.ncloud-docs.com/docs/naver-api-hub-search-local
// - 역지오코딩: NAVER Cloud Maps Reverse Geocoding (NCP_MAPS_KEY_ID / NCP_MAPS_KEY)

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 환경변수가 필요합니다`);
  return value;
}

type LocalSearchItem = { title: string; address: string; roadAddress: string; mapx: string; mapy: string };

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

/** 검색어 강조 태그(<b>)와 HTML 엔티티를 걷어낸 평문 */
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m]).trim();

/** mapx·mapy(WGS84) → 도 단위. 문서에 단위가 없고 실제 응답은 도 × 10^7 정수(예: "1269764318")라, 범위를 넘으면 10^7로 나눈다 */
function toDegrees(value: string, limit: 90 | 180) {
  const number = Number(value);
  return Math.abs(number) > limit ? number / 1e7 : number;
}

/** 지역 검색 결과(최대 5건, API 상한). 주소는 지번(address) 우선, 없으면 도로명 */
export async function searchLocal(query: string): Promise<LocationSearchItem[]> {
  const url = new URL("https://naverapihub.apigw.ntruss.com/search/v1/local");
  url.searchParams.set("query", query);
  url.searchParams.set("display", "5");
  url.searchParams.set("format", "json");
  const response = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": env("NCP_SEARCH_KEY_ID"),
      "X-NCP-APIGW-API-KEY": env("NCP_SEARCH_KEY"),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`NAVER 지역 검색 실패 ${response.status}`);
  const body: { items?: LocalSearchItem[] } = await response.json();
  return (body.items ?? []).flatMap((item) => {
    // mapx = 경도(lng), mapy = 위도(lat)
    const latitude = toDegrees(item.mapy, 90);
    const longitude = toDegrees(item.mapx, 180);
    const address = plain(item.address || item.roadAddress);
    if (!address || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    return [{ name: plain(item.title), address, latitude, longitude }];
  });
}

type Area = { name: string };
type GeocodeResult = {
  name: "roadaddr" | "addr";
  region: { area1: Area; area2: Area; area3: Area; area4: Area };
  land?: { type?: string; name?: string; number1?: string; number2?: string };
};

const joined = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");
const lotNumber = (land: GeocodeResult["land"]) =>
  land?.number1 ? `${land.number1}${land.number2 ? `-${land.number2}` : ""}` : undefined;

/** 좌표의 주소. 도로명 주소가 있으면 도로명, 없으면 지번. 바다·산처럼 주소가 없으면 null */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const url = new URL("https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc");
  url.searchParams.set("coords", `${longitude},${latitude}`);
  url.searchParams.set("orders", "roadaddr,addr");
  url.searchParams.set("output", "json");
  const response = await fetch(url, {
    headers: { "x-ncp-apigw-api-key-id": env("NCP_MAPS_KEY_ID"), "x-ncp-apigw-api-key": env("NCP_MAPS_KEY") },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`NAVER 역지오코딩 실패 ${response.status}`);
  const body: { results?: GeocodeResult[] } = await response.json();
  const results = body.results ?? [];

  const road = results.find((result) => result.name === "roadaddr");
  if (road?.land?.name) {
    const { area1, area2 } = road.region;
    return joined(area1.name, area2.name, road.land.name, lotNumber(road.land));
  }
  const lot = results.find((result) => result.name === "addr");
  if (lot) {
    const { area1, area2, area3, area4 } = lot.region;
    const mountain = lot.land?.type === "2" ? "산" : undefined;
    return joined(area1.name, area2.name, area3.name, area4.name, mountain, lotNumber(lot.land)) || null;
  }
  return null;
}
