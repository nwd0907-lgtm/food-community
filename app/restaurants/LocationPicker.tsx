"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { Icon } from "@/components/icon/Icon";
import { IconButton } from "@/components/icon-button/IconButton";
import { ListItem } from "@/components/list-item/ListItem";
import { NaverMap, type MapCoords } from "@/components/naver-map/NaverMap";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { TextField } from "@/components/text-field/TextField";
import { Toast } from "@/components/toast/Toast";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { DEFAULT_CENTER, type LocationSearchItem, type PlaceLocation } from "@/lib/place";
import { useOverlay } from "@/lib/useOverlay";
import { formContainer } from "../_components/layout";

// 맛집 등록 폼 위에 전체 화면으로 띄우는 장소 선택. 사진(File)이 담긴 폼 상태를 잃지 않도록 라우트가 아닌 오버레이로 둔다
// design.pen 09 장소 등록(지도) → 10 장소 검색(NAVER 결과) / 11 결과 없음(신규 장소로 등록)
// 지도 가운데 핀 아래 좌표가 선택 위치. 지도를 움직이면 BFF 역지오코딩으로 주소를 갱신한다
// 검색 결과를 고르면 장소명·지번 주소·좌표로 지도 화면에 돌아오고, 결과가 없어 신규 등록하면 좌표는 그대로 두고 역지오코딩한다
type Step = "map" | "search";

export type LocationPickerProps = {
  value?: PlaceLocation;
  onSelect: (location: PlaceLocation) => void;
  onClose: () => void;
};

const navContent = "lg:mx-auto lg:max-w-[1280px] lg:px-[var(--spacing-32)]";

/** BFF GET 공통: 401이면 로그인으로 보낸다 */
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error("401");
  }
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

export function LocationPicker({ value, onSelect, onClose }: LocationPickerProps) {
  const [step, setStep] = useState<Step>("map");
  const [center, setCenter] = useState<MapCoords>(value ?? DEFAULT_CENTER);
  const [address, setAddress] = useState<string | null | undefined>(value?.address);
  const [name, setName] = useState(value?.name);
  /** 지도 화면 검색창에 보여 줄 검색어 */
  const [searchText, setSearchText] = useState(value?.name ?? "");
  const [addressError, setAddressError] = useState<string>();
  const panelRef = useOverlay<HTMLDivElement>(true, () => (step === "search" ? setStep("map") : onClose()));
  const requestRef = useRef(0);

  // 좌표 → 주소. 지도를 빠르게 여러 번 움직이면 마지막 요청 결과만 반영
  const fetchAddress = (coords: MapCoords) => {
    const request = ++requestRef.current;
    getJson<{ address: string | null }>(
      `/api/location/address?latitude=${coords.latitude}&longitude=${coords.longitude}`,
    )
      .then((body) => request === requestRef.current && setAddress(body.address))
      .catch(() => request === requestRef.current && setAddressError("주소를 찾지 못했어요. 지도를 다시 움직여 주세요."));
  };

  // 처음 열 때 위치가 없으면 기본 중심의 주소부터 찾는다
  useEffect(() => {
    if (!value) fetchAddress(DEFAULT_CENTER);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 오버레이가 열려 있는 동안 뒤 페이지 스크롤을 막는다
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const moveTo = (coords: MapCoords) => {
    setCenter(coords);
    setAddress(undefined);
    setAddressError(undefined);
    fetchAddress(coords);
  };

  const [locating, setLocating] = useState(false);
  const moveToCurrentPosition = () => {
    if (!navigator.geolocation) return setAddressError("이 브라우저에서는 현재 위치를 쓸 수 없어요.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        moveTo({ latitude: coords.latitude, longitude: coords.longitude });
      },
      () => {
        setLocating(false);
        setAddressError("현재 위치를 가져오지 못했어요. 위치 권한을 확인해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  /** 검색 결과 선택: 검색창에 장소명, 지도 중심은 결과 좌표, 주소는 역지오코딩 대신 결과의 지번 주소를 쓴다 */
  const selectSearchItem = (item: LocationSearchItem) => {
    requestRef.current++;
    setCenter({ latitude: item.latitude, longitude: item.longitude });
    setAddress(item.address);
    setAddressError(undefined);
    setName(item.name);
    setSearchText(item.name);
    setStep("map");
  };

  /** 검색 결과가 없을 때: 검색어를 신규 장소명으로 두고, 지금 지도 중심 좌표의 주소를 역지오코딩한다 */
  const registerNewPlace = (query: string) => {
    setName(query);
    setSearchText(query);
    setAddress(undefined);
    setAddressError(undefined);
    fetchAddress(center);
    setStep("map");
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal
      aria-label={step === "map" ? "장소 등록" : "장소 검색"}
      className="fixed inset-0 z-30 flex flex-col bg-[var(--color-background-default)] outline-none"
    >
      {step === "map" ? (
        <>
          <TopNavigation
            title="장소 등록"
            leftAction={{ label: "뒤로 가기", icon: "arrow-left", onClick: onClose }}
            contentClassName={navContent}
          />
          <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-[var(--spacing-16)] pb-[var(--spacing-32)]">
            <NaverMap center={center} onCenterChange={moveTo} label="장소 선택 지도" className="min-h-0 flex-1">
              <div className="absolute inset-x-0 top-4 z-20 px-[var(--spacing-16)]">
                <TextField
                  label="장소 검색"
                  hideLabel
                  shape="pill"
                  size="lg"
                  readOnly
                  leadingIcon="search"
                  placeholder="맛집 이름·동네를 검색해보세요"
                  value={searchText}
                  onClick={() => setStep("search")}
                  onKeyDown={(event) => event.key === "Enter" && setStep("search")}
                  className="[&_input]:cursor-pointer"
                />
              </div>
              <IconButton
                label="현재 위치로 이동"
                icon="navigation"
                disabled={locating}
                onClick={moveToCurrentPosition}
                className="absolute right-3.5 bottom-5 z-20 size-11 bg-[var(--color-background-surface)]! text-[var(--color-text-brand)]! shadow-[0_2px_8px_#1717141F]"
              />
            </NaverMap>
            <div className="flex flex-col gap-3 px-[var(--spacing-16)] md:px-[var(--spacing-24)]">
              <div className="flex items-center gap-2">
                <Icon name="map-pin" size={20} className="text-[var(--color-text-brand)]" />
                <Text
                  variant="body-md"
                  aria-live="polite"
                  className={cn("min-w-0 flex-1", (!address || addressError) && "text-[var(--color-text-muted)]")}
                >
                  {addressError ??
                    (address === undefined
                      ? "주소를 찾는 중이에요…"
                      : (address ?? "주소가 없는 위치예요. 지도를 움직여 주세요."))}
                </Text>
              </div>
              <Button
                size="lg"
                fullWidth
                disabled={!address || !!addressError}
                onClick={() => address && onSelect({ address, ...center, name })}
              >
                이 위치로 등록하기
              </Button>
            </div>
          </div>
        </>
      ) : (
        <LocationSearch
          initialQuery={searchText}
          onBack={() => setStep("map")}
          onSelect={selectSearchItem}
          onRegister={registerNewPlace}
        />
      )}
    </div>
  );
}

/** 받침이 있으면 "을", 없으면 "를". 한글로 끝나지 않으면 "을(를)" */
function objectParticle(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return "을(를)";
  return code % 28 ? "을" : "를";
}

type SearchState =
  | { status: "idle" }
  | { status: "done"; query: string; items: LocationSearchItem[] }
  | { status: "failed" };

function LocationSearch({
  initialQuery,
  onBack,
  onSelect,
  onRegister,
}: {
  initialQuery: string;
  onBack: () => void;
  onSelect: (item: LocationSearchItem) => void;
  onRegister: (query: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<SearchState>({ status: "idle" });
  const trimmed = query.trim();

  // 입력이 멈추고 300ms 뒤 검색. 이전 요청은 취소된 것으로 보고 결과를 버린다
  useEffect(() => {
    if (!trimmed) return;
    let active = true;
    const timer = setTimeout(() => {
      getJson<LocationSearchItem[]>(`/api/location/search?query=${encodeURIComponent(trimmed)}`)
        .then((items) => active && setResult({ status: "done", query: trimmed, items }))
        .catch(() => active && setResult({ status: "failed" }));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [trimmed]);

  const shown = trimmed ? result : ({ status: "idle" } as const);
  const empty = shown.status === "done" && shown.items.length === 0;

  return (
    <>
      <TopNavigation
        title="장소 검색"
        leftAction={{ label: "뒤로 가기", icon: "arrow-left", onClick: onBack }}
        contentClassName={navContent}
      />
      <div
        className={cn(
          formContainer,
          "flex min-h-0 flex-1 flex-col overflow-y-auto pt-[var(--spacing-16)] pb-[var(--spacing-32)]",
          empty ? "gap-[var(--spacing-20)]" : "gap-2",
        )}
      >
        <TextField
          label="장소 검색"
          hideLabel
          shape="pill"
          size="lg"
          type="text"
          enterKeyHint="search"
          autoFocus
          placeholder="맛집 이름·동네를 검색해보세요"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          trailingIcon={query ? "close" : undefined}
          trailingIconLabel="검색어 지우기"
          onTrailingIconClick={() => setQuery("")}
        />

        {shown.status === "failed" && <Toast type="error" message="장소를 검색하지 못했어요. 다시 시도해 주세요." />}

        {shown.status === "done" && shown.items.length > 0 && (
          <ul aria-label="검색 결과" className="flex flex-col divide-y divide-[var(--color-border-default)]">
            {shown.items.map((item) => (
              <li key={`${item.name}-${item.address}`}>
                <ListItem icon="search" title={item.name} description={item.address} onClick={() => onSelect(item)} />
              </li>
            ))}
          </ul>
        )}

        {empty && (
          <>
            <Empty
              visual={
                <span className="flex size-12 items-center justify-center rounded-full text-[var(--color-text-muted)] shadow-[inset_0_0_0_1px_var(--color-border-default)]">
                  <Icon name="search" size={32} />
                </span>
              }
              title="검색 결과가 없어요"
              description={`"${shown.query}"${objectParticle(shown.query)}\n신규 장소로 등록해 주세요.`}
            />
            <div className="flex flex-1 flex-col justify-end">
              <Button size="lg" fullWidth onClick={() => onRegister(shown.query)}>
                신규 장소로 등록하기
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
