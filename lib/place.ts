// 맛집 BFF(/api/places) 응답 타입과 검증 규칙. 클라이언트·서버 공용 (Supabase 의존 없음)
export type PlaceImage = { id: string; url: string };

/** 목록 항목: 상세(Place)와 같은 내용 + 카드용 대표 사진(첫 장). 목록에서 상세로 갈 때 기다리지 않고 바로 그린다 */
export type PlaceSummary = Place & { thumbnailUrl: string };

/** 지도 위치(WGS84). name은 장소 검색에서 고른 경우의 상호명(저장하지 않음) */
export type PlaceLocation = { address: string; latitude: number; longitude: number; name?: string };

export type Place = {
  id: string;
  title: string;
  content: string;
  /** 위치 기능 이전에 등록된 글은 null */
  location: PlaceLocation | null;
  /** position 순. 첫 장이 대표 사진 */
  images: PlaceImage[];
  /** 로그인 사용자가 작성자면 true (수정 버튼 노출) */
  isMine: boolean;
};

/** 400·403·404 응답: field가 있으면 해당 입력 아래에 표시 */
export type PlaceError = { field?: "images" | "title" | "content" | "location"; message: string };

/** GET /api/location/search 결과 한 건 (NAVER 지역 검색) */
export type LocationSearchItem = PlaceLocation & { name: string };

export const TITLE_MAX = 30;
export const CONTENT_MIN = 10;
export const CONTENT_MAX = 300;
export const IMAGES_MIN = 1;
export const IMAGES_MAX = 5;
export const PLACE_IMAGE_TYPES = ["image/png", "image/jpeg"];
export const PLACE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const ADDRESS_MAX = 200;

/** 지도 기본 중심(서울시청). 위치가 없을 때 장소 등록 지도를 여기서 시작한다 */
export const DEFAULT_CENTER = { latitude: 37.5666, longitude: 126.9784 };

export function validateTitle(title: string) {
  const length = title.trim().length;
  if (length === 0) return "가게 이름을 입력해 주세요.";
  if (length > TITLE_MAX) return `${TITLE_MAX}자 이내로 입력해 주세요.`;
}

export function validateContent(content: string) {
  const length = content.trim().length;
  if (length === 0) return "추천 이야기를 입력해 주세요.";
  if (length < CONTENT_MIN) return `${CONTENT_MIN}자 이상 입력해 주세요.`;
  if (length > CONTENT_MAX) return `${CONTENT_MAX}자 이내로 입력해 주세요.`;
}

export function validateImageCount(count: number) {
  if (count < IMAGES_MIN) return "사진을 1장 이상 올려 주세요.";
  if (count > IMAGES_MAX) return `사진은 최대 ${IMAGES_MAX}장까지 올릴 수 있어요.`;
}

export function validateImageFile(file: File) {
  if (!PLACE_IMAGE_TYPES.includes(file.type)) return "PNG 또는 JPG 사진만 올릴 수 있어요.";
  if (file.size > PLACE_IMAGE_MAX_BYTES) return "사진은 장당 10MB 이하로 올려 주세요.";
}

export function validateLocation(location: Partial<PlaceLocation> | null | undefined) {
  if (!location) return "장소를 등록해 주세요.";
  const address = location.address?.trim() ?? "";
  const { latitude, longitude } = location;
  if (!address || latitude == null || longitude == null) return "장소를 등록해 주세요.";
  if (address.length > ADDRESS_MAX) return `주소는 ${ADDRESS_MAX}자 이내여야 해요.`;
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180)
    return "위치를 다시 선택해 주세요.";
}
