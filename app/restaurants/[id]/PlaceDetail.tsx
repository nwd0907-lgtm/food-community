"use client";

import { notFound } from "next/navigation";
import { Icon } from "@/components/icon/Icon";
import { NaverMap } from "@/components/naver-map/NaverMap";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { Toast } from "@/components/toast/Toast";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { usePlace } from "@/lib/usePlace";
import { AppTopNavigation } from "../../_components/AppTopNavigation";
import { readingContainer } from "../../_components/layout";
import { PhotoGallery } from "./PhotoGallery";

// 상세 조회 GET /api/places/[id]. 작성자 본인이면 탑 내비 오른쪽에 수정 버튼
// design.pen 02 상세 · 켄홈: 사진 갤러리 → 위치(미니 지도 · 주소) → 추천 이야기. 위치 없는 예전 글은 위치 섹션을 뺀다
export function PlaceDetail({ id }: { id: string }) {
  const { place, status } = usePlace(id);

  if (status === "notFound") notFound();
  if (status === "failed")
    return (
      <>
        <AppTopNavigation
          title="맛집"
          leftAction={{ label: "뒤로 가기", icon: "chevron-left", back: true, fallbackHref: "/" }}
          className="sticky top-0 z-10"
        />
        <Toast
          type="error"
          message="맛집을 불러오지 못했어요. 새로고침해 주세요."
          className={cn(readingContainer, "mt-[var(--spacing-24)]")}
        />
      </>
    );
  if (!place) return <RestaurantDetailSkeleton />;

  return (
    <>
      <title>{place.title}</title>
      <AppTopNavigation
        title={place.title}
        leftAction={{ label: "뒤로 가기", icon: "chevron-left", back: true, fallbackHref: "/" }}
        rightActions={place.isMine ? [{ label: "수정", icon: "edit", href: `/restaurants/${place.id}/edit` }] : []}
        className="sticky top-0 z-10"
      />
      <main className="flex flex-col md:pt-[var(--spacing-24)]">
        <div className="mx-auto w-full max-w-3xl md:px-[var(--spacing-24)]">
          <h2 className="sr-only">{place.title}</h2>
          <PhotoGallery
            name={place.title}
            photos={place.images.map((image, i) => ({ src: image.url, alt: `${place.title} 사진 ${i + 1}` }))}
          />
        </div>
        {place.location && (
          <section
            aria-labelledby="place-location-title"
            className={cn(readingContainer, "flex flex-col gap-[var(--spacing-8)] py-5")}
          >
            <div className="flex flex-col gap-[var(--spacing-12)]">
              <Text variant="heading-sm" as="h3" id="place-location-title">
                위치
              </Text>
              {/* 미리보기 지도는 조작을 막고, 누르면 NAVER 지도에서 주소로 연다 (PRD: 지도 앱에서 열기) */}
              <a
                href={`https://map.naver.com/p/search/${encodeURIComponent(place.location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${place.title} 위치를 NAVER 지도에서 열기`}
                className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]"
              >
                <NaverMap
                  center={place.location}
                  interactive={false}
                  label={`${place.title} 위치 지도`}
                  className="pointer-events-none h-40 rounded-xl"
                />
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="map-pin" size={16} className="text-[var(--color-text-brand)]" />
              <Text variant="body-md" className="min-w-0 flex-1 text-[var(--color-text-muted)]">
                {place.location.address}
              </Text>
            </div>
          </section>
        )}
        <article
          className={cn(
            readingContainer,
            "flex flex-col gap-[var(--spacing-12)] pb-9",
            place.location ? "pt-2.5" : "pt-[var(--spacing-24)]",
          )}
        >
          <Text variant="heading-sm" as="h3">
            추천 이야기
          </Text>
          <Text variant="body-md" className="whitespace-pre-line">
            {place.content}
          </Text>
        </article>
      </main>
    </>
  );
}

export function RestaurantDetailSkeleton() {
  return (
    <>
      <div className="h-14 shadow-[inset_0_-1px_0_var(--color-border-default)]" />
      <div className="flex flex-col md:pt-[var(--spacing-24)]">
        <div className="mx-auto w-full max-w-3xl md:px-[var(--spacing-24)]">
          <Skeleton variant="rectangle" width="100%" height={480} className="rounded-none! md:rounded-xl!" />
        </div>
        <div className={cn(readingContainer, "flex flex-col gap-[var(--spacing-12)] py-5")}>
          <Skeleton variant="text" typography="heading-sm" width={40} />
          <Skeleton variant="rectangle" width="100%" height={160} className="rounded-xl!" />
        </div>
        <div className={cn(readingContainer, "flex flex-col gap-[var(--spacing-8)] pt-2.5")}>
          <Skeleton variant="text" typography="body-md" />
          <Skeleton variant="text" typography="body-md" />
          <Skeleton variant="text" typography="body-md" width="60%" />
        </div>
      </div>
    </>
  );
}
