import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen 10 장소 검색 · 검색 결과 행: 아이콘 16(muted) · 제목 label-lg · 설명 label-md(muted), 패딩 12/8, 간격 12
// 행 사이 구분선(border-default, 마지막 행 제외)은 목록에서 divide-y로 그린다
export type ListItemProps = {
  title: string;
  description?: string;
  icon?: IconName;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function ListItem({ title, description, icon, type = "button", className, ...props }: ListItemProps) {
  return (
    <button
      type={type}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 bg-[var(--color-background-surface)] px-3 py-2 text-left",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
        "disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)]",
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="flex h-5 w-4 shrink-0 items-center justify-center text-[var(--color-text-muted)]">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <Text variant="label-lg" as="span" className="truncate">
          {title}
        </Text>
        {description && (
          <Text variant="label-md" as="span" className="truncate text-[var(--color-text-muted)]">
            {description}
          </Text>
        )}
      </span>
    </button>
  );
}
