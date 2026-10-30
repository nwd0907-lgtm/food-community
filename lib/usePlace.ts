"use client";

import { useEffect, useState } from "react";
import type { Place, PlaceSummary } from "./place";

// BFF GET 요청 공통: 401이면 로그인 페이지로 보내고, 404는 notFound로 구분한다
function useBff<T>(url: string) {
  const [data, setData] = useState<T>();
  const [status, setStatus] = useState<"loading" | "ok" | "notFound" | "failed">("loading");

  useEffect(() => {
    let active = true;
    fetch(url)
      .then(async (response) => {
        if (response.status === 401) {
          window.location.replace("/login");
          return;
        }
        if (response.status === 404) {
          if (active) setStatus("notFound");
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        const body: T = await response.json();
        if (active) {
          setData(body);
          setStatus("ok");
        }
      })
      .catch(() => active && setStatus("failed"));
    return () => {
      active = false;
    };
  }, [url]);

  return { data, setData, status };
}

/** GET /api/places (mine이면 ?mine=1). setPlaces는 삭제 후 목록을 바로 갱신할 때 */
export function usePlaces({ mine = false } = {}) {
  const { data, setData, status } = useBff<PlaceSummary[]>(mine ? "/api/places?mine=1" : "/api/places");
  return { places: data, setPlaces: setData, status };
}

/** GET /api/places/[id] */
export function usePlace(id: string) {
  const { data, status } = useBff<Place>(`/api/places/${encodeURIComponent(id)}`);
  return { place: data, status };
}
