"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type UIEvent } from "react";
import { Icon } from "@/components/icon/Icon";
import { ProductBanner } from "@/components/product-banner/ProductBanner";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import type { ProductBanner as Banner } from "@/lib/product";
import { gridContainer } from "./layout";

// design.pen 01 메인 · 메인 상품 배너 영역: 헤더 바로 아래 2:1 배너(모바일은 화면 끝까지, 라운드 0) · 아래 여백 16
// 우하단 컨트롤: 정지(재생) 버튼 24 + "현재 | 전체  전체보기 >" 알약 24 (검정 60%, 그림자)
// 가로 스와이프(scroll-snap)로 넘기고, 4초마다 다음 배너로 넘어간다. 마지막 다음은 처음으로
// 1280 확장: md부터는 그리드 여백 안에서 라운드 16 배너를 2장(xl 3장)씩 보여 준다
const AUTOPLAY_MS = 4000;
const SLIDE = "w-full shrink-0 snap-start md:w-[calc((100%-var(--spacing-16))/2)] xl:w-[calc((100%-2*var(--spacing-16))/3)]";
const SIZES = "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 410px";
const CONTROL =
  "flex h-6 items-center rounded-full bg-[color-mix(in_srgb,var(--color-background-strong)_60%,transparent)] text-[var(--color-text-on-strong)] shadow-[0_2px_6px_color-mix(in_srgb,var(--color-background-strong)_40%,transparent)]";

export function HomeBanner({ banners }: { banners: Banner[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // 사용자가 넘겨 index가 바뀌어도 타이머를 다시 시작해, 넘기자마자 또 넘어가지 않게 한다
  useEffect(() => {
    if (paused || banners.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const list = listRef.current;
      const first = list?.firstElementChild as HTMLElement | null;
      if (!list || !first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || "0");
      const end = list.scrollWidth - list.clientWidth;
      list.scrollTo({ left: list.scrollLeft + step > end + 1 ? 0 : list.scrollLeft + step, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, index, banners.length]);

  if (banners.length === 0) return null;

  const onScroll = (event: UIEvent<HTMLUListElement>) => {
    const list = event.currentTarget;
    const first = list.firstElementChild as HTMLElement | null;
    if (!first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || "0");
    setIndex(Math.min(banners.length - 1, Math.round(list.scrollLeft / step)));
  };

  const current = banners[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="강연·모임"
      className={cn(gridContainer, "pb-[var(--spacing-16)]")}
    >
      {/* 모바일은 그리드 좌우 여백(16)을 지워 화면 끝까지 붙인다 */}
      <div className="relative -mx-[var(--spacing-16)] md:mx-0">
        <ul
          ref={listRef}
          onScroll={onScroll}
          aria-live={paused ? "polite" : "off"}
          className="flex snap-x snap-mandatory overflow-x-auto md:gap-[var(--spacing-16)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {banners.map((banner, i) => (
            <li
              key={banner.image.src}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${banners.length}`}
              className={SLIDE}
            >
              <ProductBanner
                href={`/products/${banner.productId}`}
                image={{ ...banner.image, preload: i === 0, sizes: SIZES }}
                imageClassName={banner.positionClassName}
                rounded={false}
                className="md:rounded-2xl"
              />
            </li>
          ))}
        </ul>

        <div className="absolute right-[var(--spacing-8)] bottom-[var(--spacing-8)] flex items-center gap-1">
          {banners.length > 1 && (
            <button
              type="button"
              aria-label={paused ? "배너 자동 넘김 재생" : "배너 자동 넘김 정지"}
              onClick={() => setPaused((value) => !value)}
              className={cn(
                CONTROL,
                "w-6 cursor-pointer justify-center gap-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
              )}
            >
              {paused ? (
                // 재생: 오른쪽을 향한 삼각형 (정지 막대와 같은 8px 높이)
                <span aria-hidden className="ml-0.5 h-0 w-0 border-y-4 border-l-[7px] border-y-transparent border-l-current" />
              ) : (
                <>
                  <span aria-hidden className="h-2 w-0.5 rounded-[1px] bg-current" />
                  <span aria-hidden className="h-2 w-0.5 rounded-[1px] bg-current" />
                </>
              )}
            </button>
          )}
          <Link
            href={`/products/${current.productId}`}
            className={cn(
              CONTROL,
              "gap-px pr-px pl-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
            )}
          >
            <Text variant="label-md" className="font-[number:var(--font-weight-semibold)] whitespace-pre">
              <span className="sr-only">{`${banners.length}개 중 ${index + 1}번째 배너, `}</span>
              <span aria-hidden>{`${index + 1} | ${banners.length}  `}</span>
              전체보기
            </Text>
            {/* 시안 12px: 아이콘 스케일(16~)에 없어 16을 12로 줄여 그린다 */}
            <Icon name="chevron-right" size={16} strokeWidth={3} className="size-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
