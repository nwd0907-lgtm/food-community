import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "../badge/Badge";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen card/default: 이미지(190, 라운드 12, 좌상단 배지) 추가·제외 가능 · 제목행 · 한줄 설명 · 태그 배지
// size — lg: card/default 원본 / md: 메인 피드(간격 4, 제목 heading-sm, 설명 한 줄) / sm: 마이페이지 2열(이미지 112, 라운드 8)
const sizeStyles = {
  lg: { root: "gap-[var(--spacing-12)]", image: "h-[190px] rounded-xl", title: "heading-md", clamp: "" },
  md: { root: "gap-1", image: "h-[190px] rounded-xl", title: "heading-sm", clamp: "truncate" },
  sm: { root: "gap-1", image: "h-28 rounded-lg", title: "heading-sm", clamp: "truncate" },
} as const;

export type CardSize = keyof typeof sizeStyles;

export type CardProps = {
  size?: CardSize;
  title: string;
  /** preload: 첫 화면(LCP) 이미지면 true */
  image?: { src: string; alt: string; preload?: boolean };
  /** 이미지 좌상단 배지 */
  imageBadge?: string;
  /** 제목 우측 메타 정보(예: 차로 18분) */
  meta?: { icon: IconName; label: string };
  description?: string;
  tags?: string[];
  /** 추가 콘텐츠 */
  children?: ReactNode;
  className?: string;
};

export function Card({
  size = "lg",
  title,
  image,
  imageBadge,
  meta,
  description,
  tags,
  children,
  className,
}: CardProps) {
  const styles = sizeStyles[size];
  return (
    <article className={cn("flex w-full flex-col", styles.root, className)}>
      {image && (
        <div className={cn("relative w-full overflow-hidden bg-[var(--color-background-disabled)]", styles.image)}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            preload={image.preload}
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
          {imageBadge && <Badge label={imageBadge} className="absolute top-3 left-3" />}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 pt-2">
        <Text variant={styles.title} as="h3" className="min-w-0 truncate">
          {title}
        </Text>
        {meta && (
          <span className="flex shrink-0 items-center gap-[var(--spacing-8)] text-[var(--color-text-brand)]">
            <Icon name={meta.icon} size={16} />
            <Text variant="label-md">{meta.label}</Text>
          </span>
        )}
      </div>
      {description && (
        <Text variant="body-md" className={cn("text-[var(--color-text-muted)]", styles.clamp)}>
          {description}
        </Text>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-[var(--spacing-8)]">
          {tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </div>
      )}
      {children}
    </article>
  );
}
