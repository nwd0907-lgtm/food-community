import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icon/Icon";

// design.pen Icon Button Foundation: 48×48 원형, 아이콘 24
const variantClasses = {
  ghost: "bg-transparent text-[var(--color-text-default)]",
  "circle-brand": "bg-[var(--color-background-brand)] text-[var(--color-text-on-brand)]",
  "circle-neutral": "bg-[var(--color-background-strong)] text-[var(--color-text-on-strong)]",
} as const;

// md가 디자인 기본(48/24). sm(32/16)은 파일 아이템 삭제 버튼처럼 디자인 내 인스턴스에서 축소해 쓰는 경우
// lg(56/24)는 메인 맛집 등록 플로팅 버튼처럼 확대해 쓰는 경우
const sizeClasses = { sm: "size-8", md: "size-12", lg: "size-14" } as const;
const iconSize = { sm: 16, md: 24, lg: 24 } as const;

export type IconButtonVariant = keyof typeof variantClasses;

export type IconButtonProps = {
  /** 접근성 이름(필수) */
  label: string;
  icon?: IconName;
  variant?: IconButtonVariant;
  size?: keyof typeof sizeClasses;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function IconButton({
  label,
  icon = "heart",
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={iconSize[size]} />
    </button>
  );
}
