"use client";

import Image from "next/image";
import { useState, type UIEvent } from "react";
import { Text } from "@/components/typography/Text";

export type Photo = { src: string; alt: string };

// design.pen 02 상세 사진 갤러리: 480 높이, 하단 딤드 그라디언트, 좌하단 가게명, 우하단 "현재 / 전체" 배지
// 가로 스와이프(scroll-snap)로 넘기고, 배지는 현재 보이는 사진 순번을 따른다
export function PhotoGallery({ name, photos }: { name: string; photos: Photo[] }) {
  const [index, setIndex] = useState(0);

  const onScroll = (event: UIEvent<HTMLUListElement>) => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    setIndex(Math.round(scrollLeft / clientWidth));
  };

  return (
    <section aria-label={`${name} 사진`} className="relative h-[480px] w-full overflow-hidden md:rounded-xl">
      <ul
        onScroll={onScroll}
        className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <li key={photo.src} className="relative size-full shrink-0 snap-start">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              preload={i === 0}
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_52%,color-mix(in_srgb,var(--color-background-strong)_40%,transparent)_76%,color-mix(in_srgb,var(--color-background-strong)_85%,transparent)_100%)]"
      />
      <Text
        variant="heading-lg"
        as="p"
        aria-hidden
        className="pointer-events-none absolute bottom-[37px] left-[var(--spacing-16)] text-[var(--color-text-on-strong)]"
      >
        {name}
      </Text>
      <span className="pointer-events-none absolute right-[var(--spacing-16)] bottom-[var(--spacing-16)] flex h-5 w-14 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--color-background-strong)_70%,transparent)] text-[var(--color-text-on-strong)]">
        <Text variant="label-md" className="font-[number:var(--font-weight-bold)]">
          {index + 1}
        </Text>
        <Text variant="label-md" className="whitespace-pre">
          {` / ${photos.length}`}
        </Text>
      </span>
    </section>
  );
}
