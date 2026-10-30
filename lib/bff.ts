"use client";

import { useEffect, useSyncExternalStore } from "react";

// BFF GET 응답 캐시 (stale-while-revalidate). 화면에 다시 들어오면 받아 둔 데이터를 바로 보여 주고 뒤에서 갱신한다.
// - 같은 주소의 동시 요청은 하나로 합친다
// - 401이면 로그인 페이지로, 404는 notFound로 구분한다
// - 저장·삭제 뒤에는 writeBff로 캐시를 직접 고쳐, 다시 받지 않아도 화면이 맞게 한다

export type BffStatus = "loading" | "ok" | "notFound" | "failed";

type Entry = { data?: unknown; status: BffStatus; fetchedAt: number };

/** 이 시간 안에 같은 데이터를 다시 쓰면 재요청하지 않는다 */
const FRESH_MS = 10_000;
const LOADING: Entry = { status: "loading", fetchedAt: 0 };

const entries = new Map<string, Entry>();
const inflight = new Map<string, Promise<void>>();
const listeners = new Map<string, Set<() => void>>();

function setEntry(url: string, entry: Entry) {
  entries.set(url, entry);
  listeners.get(url)?.forEach((listener) => listener());
}

function subscribe(url: string, listener: () => void) {
  let set = listeners.get(url);
  if (!set) listeners.set(url, (set = new Set()));
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

function fetchBff(url: string) {
  const running = inflight.get(url);
  if (running) return running;
  const request = fetch(url)
    .then(async (response) => {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      if (response.status === 404) return setEntry(url, { status: "notFound", fetchedAt: Date.now() });
      if (!response.ok) throw new Error(String(response.status));
      setEntry(url, { data: await response.json(), status: "ok", fetchedAt: Date.now() });
    })
    .catch(() => {
      // 이미 보여 주는 데이터가 있으면 그대로 두고, 처음 받다가 실패한 경우만 실패로 표시
      if (entries.get(url)?.data === undefined) setEntry(url, { status: "failed", fetchedAt: Date.now() });
    })
    .finally(() => inflight.delete(url));
  inflight.set(url, request);
  return request;
}

/** 캐시가 없거나 오래됐으면 받아 둔다. 카드 탭 · 호버처럼 이동 직전에 불러 대기 시간을 줄인다 */
export function prefetchBff(url: string) {
  const entry = entries.get(url);
  if (!entry || entry.status !== "ok" || Date.now() - entry.fetchedAt > FRESH_MS) void fetchBff(url);
}

/** 캐시에 있는 데이터(구독 없이 한 번 읽기) */
export function readBff<T>(url: string) {
  return entries.get(url)?.data as T | undefined;
}

/** 저장 · 삭제 결과를 캐시에 바로 반영. 함수를 넘기면 이전 값으로 계산하고, 이전 값이 없으면 건너뛴다 */
export function writeBff<T>(url: string, next: T | ((prev: T) => T)) {
  const prev = entries.get(url);
  if (typeof next === "function") {
    if (prev?.data === undefined) return;
    next = (next as (prev: T) => T)(prev.data as T);
  }
  setEntry(url, { data: next, status: "ok", fetchedAt: prev?.fetchedAt ?? Date.now() });
}

/** 다음에 화면에 들어올 때 다시 받도록 표시. 지금 보고 있는 화면이면 바로 갱신한다 */
export function invalidateBff(url: string) {
  const entry = entries.get(url);
  if (!entry) return;
  entries.set(url, { ...entry, fetchedAt: 0 });
  if (listeners.get(url)?.size) void fetchBff(url);
}

/** 캐시에서 지운다. 삭제한 글처럼 다음 진입 때 처음부터 받아야 하는 경우 */
export function forgetBff(url: string) {
  entries.delete(url);
}

/** 캐시 비우기 (로그아웃) */
export function clearBff() {
  entries.clear();
}

/** GET url. 캐시가 있으면 즉시 반환하고 오래됐으면 뒤에서 갱신한다 */
export function useBff<T>(url: string) {
  const entry = useSyncExternalStore(
    (listener) => subscribe(url, listener),
    () => entries.get(url) ?? LOADING,
    () => LOADING,
  );
  useEffect(() => prefetchBff(url), [url]);
  return { data: entry.data as T | undefined, status: entry.status };
}
