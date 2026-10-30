"use client";

import { forgetBff, invalidateBff, prefetchBff, readBff, useBff, writeBff } from "./bff";
import type { Place, PlaceSummary } from "./place";

const LIST_URLS = ["/api/places", "/api/places?mine=1"] as const;
const placeUrl = (id: string) => `/api/places/${encodeURIComponent(id)}`;

/** GET /api/places (mine이면 ?mine=1) */
export function usePlaces({ mine = false } = {}) {
  const { data, status } = useBff<PlaceSummary[]>(mine ? LIST_URLS[1] : LIST_URLS[0]);
  return { places: data, status };
}

/** 메인 목록을 화면 코드가 로드되는 즉시(하이드레이션 전) 받기 시작한다 */
export function prefetchPlaces() {
  prefetchBff(LIST_URLS[0]);
}

/** GET /api/places/[id]. 목록에서 온 경우 목록 항목(상세와 같은 내용)으로 먼저 그리고 뒤에서 갱신한다 */
export function usePlace(id: string) {
  const { data, status } = useBff<Place>(placeUrl(id));
  const seed = data ?? findInLists(id);
  return { place: seed, status: seed && status === "loading" ? ("ok" as const) : status };
}

function findInLists(id: string) {
  for (const url of LIST_URLS) {
    const found = readBff<PlaceSummary[]>(url)?.find((place) => place.id === id);
    if (found) return found;
  }
}

/** 등록 · 수정 결과를 상세와 목록 캐시에 반영하고, 목록은 서버 순서로 다시 맞춘다 */
export function savePlaceToCache(saved: Place) {
  writeBff(placeUrl(saved.id), saved);
  const summary: PlaceSummary = { ...saved, thumbnailUrl: saved.images[0]?.url ?? "" };
  for (const url of LIST_URLS) {
    writeBff<PlaceSummary[]>(url, (list) =>
      list.some((place) => place.id === saved.id)
        ? list.map((place) => (place.id === saved.id ? summary : place))
        : [summary, ...list],
    );
    invalidateBff(url);
  }
}

/** 삭제한 맛집을 목록 캐시에서 빼고 상세 캐시는 지운다 */
export function removePlaceFromCache(id: string) {
  for (const url of LIST_URLS) writeBff<PlaceSummary[]>(url, (list) => list.filter((place) => place.id !== id));
  forgetBff(placeUrl(id));
}
