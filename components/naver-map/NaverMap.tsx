"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// design.pen 09 장소 등록 · 02 상세 미니 지도: NAVER 지도 + 가운데 고정 파란 핀(40×41, 핀 끝이 지도 중심)
// 핀은 지도 마커가 아니라 화면 고정 오버레이라, 지도를 움직이면 핀 아래 좌표가 곧 선택 위치가 된다
// SDK 키(NEXT_PUBLIC_NCP_MAPS_KEY_ID)는 브라우저용 Client ID로, NAVER Cloud 콘솔의 서비스 URL 제한으로 보호한다
// 키가 없거나 SDK를 못 불러오면 지도 배경색(color-background-map)과 핀만 보인다

export type MapCoords = { latitude: number; longitude: number };

export type NaverMapProps = {
  center: MapCoords;
  zoom?: number;
  /** false면 끌기·확대 등 조작을 막은 미리보기 지도 */
  interactive?: boolean;
  /** 사용자가 지도를 움직이고 멈췄을 때의 중심 좌표 */
  onCenterChange?: (center: MapCoords) => void;
  /** 지도 위에 띄우는 요소(검색창, 현재 위치 버튼 등). 위치는 사용하는 쪽에서 absolute로 지정 */
  children?: ReactNode;
  /** 지도 영역 접근성 이름 */
  label?: string;
  className?: string;
};

type NaverLatLng = { lat(): number; lng(): number };
type NaverMapInstance = {
  getCenter(): NaverLatLng;
  setCenter(latLng: NaverLatLng): void;
  destroy(): void;
};
type NaverMaps = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => NaverMapInstance;
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Event: { addListener(target: NaverMapInstance, event: string, listener: () => void): unknown };
};

declare global {
  interface Window {
    naver?: { maps: NaverMaps };
  }
}

const KEY_ID = process.env.NEXT_PUBLIC_NCP_MAPS_KEY_ID;
let sdk: Promise<NaverMaps> | undefined;

/** SDK 스크립트는 페이지당 한 번만 넣는다 */
function loadNaverMaps() {
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);
  if (!KEY_ID) return Promise.reject(new Error("NEXT_PUBLIC_NCP_MAPS_KEY_ID 환경변수가 필요합니다"));
  sdk ??= new Promise<NaverMaps>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(KEY_ID)}`;
    script.async = true;
    script.onload = () => (window.naver?.maps ? resolve(window.naver.maps) : reject(new Error("NAVER 지도 SDK 없음")));
    script.onerror = () => {
      sdk = undefined;
      reject(new Error("NAVER 지도 SDK를 불러오지 못했습니다"));
    };
    document.head.appendChild(script);
  });
  return sdk;
}

const same = (a: MapCoords, b: MapCoords) =>
  Math.abs(a.latitude - b.latitude) < 1e-6 && Math.abs(a.longitude - b.longitude) < 1e-6;

export function NaverMap({
  center,
  zoom = 16,
  interactive = true,
  onCenterChange,
  children,
  label = "지도",
  className,
}: NaverMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ map: NaverMapInstance; maps: NaverMaps }>(null);
  const centerRef = useRef(center);
  const onCenterChangeRef = useRef(onCenterChange);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
  }, [onCenterChange]);

  // 지도는 한 번만 만들고, 중심·줌 변경은 아래 effect에서 반영한다
  useEffect(() => {
    let active = true;
    loadNaverMaps()
      .then((maps) => {
        if (!active || !elementRef.current) return;
        const { latitude, longitude } = centerRef.current;
        const map = new maps.Map(elementRef.current, {
          center: new maps.LatLng(latitude, longitude),
          zoom,
          draggable: interactive,
          pinchZoom: interactive,
          scrollWheel: interactive,
          keyboardShortcuts: interactive,
          disableDoubleClickZoom: !interactive,
          disableDoubleTapZoom: !interactive,
          disableTwoFingerTapZoom: !interactive,
          scaleControl: false,
          mapDataControl: false,
          logoControlOptions: { position: 1 },
        });
        maps.Event.addListener(map, "idle", () => {
          const next = { latitude: map.getCenter().lat(), longitude: map.getCenter().lng() };
          if (same(next, centerRef.current)) return;
          centerRef.current = next;
          onCenterChangeRef.current?.(next);
        });
        mapRef.current = { map, maps };
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
      mapRef.current?.map.destroy();
      mapRef.current = null;
    };
    // zoom·interactive는 생성 시점 값만 쓴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 부모가 중심을 바꾸면(검색 결과 선택, 현재 위치) 지도를 옮긴다
  useEffect(() => {
    if (same(center, centerRef.current)) return;
    centerRef.current = center;
    const current = mapRef.current;
    current?.map.setCenter(new current.maps.LatLng(center.latitude, center.longitude));
  }, [center]);

  return (
    <div className={cn("relative isolate overflow-hidden bg-[var(--color-background-map)]", className)}>
      {/* SDK가 지도 요소에 position: relative를 인라인으로 덮어써서, 위치는 바깥 래퍼가 잡고 지도 요소는 채우기만 한다 */}
      <div className="absolute inset-0">
        <div ref={elementRef} role="region" aria-label={label} data-failed={failed || undefined} className="size-full" />
      </div>
      {/* 핀 끝(이미지 높이의 90%)이 지도 중심에 오도록 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/naver-blue-pin.png"
        alt=""
        aria-hidden
        width={40}
        height={41}
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-[41px] w-10 -translate-x-1/2 -translate-y-[37px]"
      />
      {children}
    </div>
  );
}
