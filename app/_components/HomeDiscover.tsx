"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { Card } from "@/components/card/Card";
import { Empty } from "@/components/empty/Empty";
import { Icon } from "@/components/icon/Icon";
import { IconButton } from "@/components/icon-button/IconButton";
import { Spinner } from "@/components/spinner/Spinner";
import { TextField } from "@/components/text-field/TextField";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { usePlaces } from "@/lib/usePlace";
import { gridContainer } from "./layout";

// design.pen 01 메인 · 발견: 브랜드 헤더(워드마크 + 검색, 데스크톱은 + 마이) · 피드(제목 + 카드 + 로딩 스피너) · 등록 플로팅 버튼
// 목록은 BFF GET /api/places (최신순). 검색은 받은 목록 안에서 이름·내용으로 거른다
export function HomeDiscover() {
  const router = useRouter();
  const { places = [], status } = usePlaces();
  const [query, setQuery] = useState("");
  const keyword = query.trim();
  const results = keyword
    ? places.filter((item) => item.title.includes(keyword) || item.content.includes(keyword))
    : places;
  const searchProps = {
    label: "맛집 검색",
    hideLabel: true,
    shape: "pill",
    type: "text",
    inputMode: "search",
    leadingIcon: "search",
    placeholder: "맛집 이름·동네를 검색해보세요",
    value: query,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
  } as const;

  return (
    <>
      <header
        className={cn(
          gridContainer,
          "flex flex-col gap-[var(--spacing-16)] pt-[var(--spacing-8)] pb-[var(--spacing-20)]",
          // 데스크톱: 워드마크 · 검색(한 단계 작은 md, 최대 448) · 마이 아이콘을 한 줄에 둔다
          "lg:flex-row lg:items-center lg:gap-[var(--spacing-24)] lg:py-[var(--spacing-16)]",
        )}
      >
        <div className="flex h-[31px] shrink-0 items-center">
          <Text variant="heading-lg" as="h1" className="text-[var(--color-text-brand)]">
            FOOOD
          </Text>
        </div>
        {/* TextField size는 반응형 prop이 없어 모바일(lg)·데스크톱(md) 인스턴스를 CSS로 전환한다.
            cn은 클래스 충돌을 정리하지 않으므로 컴포넌트 기본 display와 겹치지 않게 감싼 요소에서 숨긴다 */}
        <TextField {...searchProps} size="lg" className="lg:hidden" />
        <div className="hidden w-full min-w-0 max-w-md lg:block">
          <TextField {...searchProps} size="md" />
        </div>
        <div className="ml-auto hidden shrink-0 lg:block">
          <Link
            href="/my"
            aria-label="마이페이지"
            className="inline-flex h-12 items-center gap-1 rounded-full px-3 text-[var(--color-text-default)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]"
          >
            <Icon name="user-round" size={24} />
            <Text variant="label-md" as="span">
              마이
            </Text>
          </Link>
        </div>
      </header>

      <main
        className={cn(
          gridContainer,
          "flex flex-1 flex-col gap-[var(--spacing-20)] pt-[var(--spacing-8)] pb-[var(--spacing-24)]",
        )}
      >
        <div className="pb-1">
          <Text variant="heading-md" as="h2">
            {keyword ? `‘${keyword}’ 검색 결과` : "대부도 추천 맛집"}
          </Text>
        </div>

        {status === "loading" ? (
          <div className="flex items-center justify-center py-[var(--spacing-16)]">
            <Spinner label="맛집을 불러오는 중" />
          </div>
        ) : status === "failed" ? (
          <Empty visual="error" title="맛집을 불러오지 못했어요" description="잠시 후 새로고침해 주세요." />
        ) : results.length > 0 ? (
          <ul className="grid grid-cols-1 gap-x-[var(--spacing-16)] gap-y-[var(--spacing-20)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((place, i) => (
              <li key={place.id}>
                <Link
                  href={`/restaurants/${place.id}`}
                  className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-border-brand)]"
                >
                  <Card
                    size="md"
                    title={place.title}
                    image={{ src: place.thumbnailUrl, alt: `${place.title} 대표 사진`, preload: i === 0 }}
                    description={place.content}
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : keyword ? (
          <Empty
            visual="search"
            title="검색 결과가 없어요"
            description="다른 맛집 이름이나 동네로 검색해보세요."
            secondaryAction={{ label: "검색어 지우기", onClick: () => setQuery("") }}
          />
        ) : (
          <Empty
            visual="utensils"
            title="아직 등록된 맛집이 없어요"
            description="처음으로 숨은 맛집을 소개해 주세요."
            primaryAction={{ label: "맛집 등록", onClick: () => router.push("/restaurants/new") }}
          />
        )}
      </main>

      <IconButton
        label="맛집 등록"
        icon="plus"
        variant="circle-brand"
        size="lg"
        onClick={() => router.push("/restaurants/new")}
        className={cn(
          "fixed z-20 shadow-[0_4px_12px_color-mix(in_srgb,var(--color-background-strong)_16%,transparent)]",
          // 바텀 내비(56) · 설치 띠배너 위 32(데스크톱은 바텀 내비가 없어 바닥에서 32), 넓은 화면에서는 1280 컨테이너 안쪽 오른쪽 끝에 맞춘다
          "bottom-[calc(56px+var(--app-install-banner-height)+var(--spacing-32))] lg:bottom-[var(--spacing-32)] right-[max(var(--spacing-16),calc((100vw-1280px)/2+var(--spacing-32)))]",
        )}
      />
    </>
  );
}
