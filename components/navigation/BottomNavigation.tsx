"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen navigation/bottom/4-items: 높이 56, 아이템 2~5개 균등 분배, 아이콘 24 필수, 레이블 label-md 추가·제외 가능
// 미선택: 아웃라인 + 뉴트럴(text-muted) / 선택: 필 + 브랜드(text-brand)
export type BottomNavigationItem = {
  value: string;
  label: string;
  /** 필 아이콘이 있는 이름(filledIconNames)을 쓰면 선택 시 필 스타일로 바뀐다 */
  icon: IconName;
};

export type BottomNavigationProps = {
  items: BottomNavigationItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** false면 레이블을 숨기고 아이콘만 표시(접근성 이름은 유지) */
  showLabels?: boolean;
  className?: string;
};

export function BottomNavigation({
  items,
  value,
  defaultValue,
  onChange,
  showLabels = true,
  className,
}: BottomNavigationProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const selected = value ?? internal;

  if (process.env.NODE_ENV !== "production" && (items.length < 2 || items.length > 5)) {
    console.warn(`BottomNavigation: 아이템은 2~5개여야 합니다 (현재 ${items.length}개)`);
  }

  return (
    <nav
      className={cn(
        "flex h-14 w-full items-stretch bg-[var(--color-background-surface)] shadow-[inset_0_1px_0_var(--color-border-default)]",
        className,
      )}
    >
      {items.map((item) => {
        const isSelected = item.value === selected;
        return (
          <button
            key={item.value}
            type="button"
            aria-current={isSelected ? "page" : undefined}
            aria-label={showLabels ? undefined : item.label}
            onClick={() => {
              setInternal(item.value);
              onChange?.(item.value);
            }}
            className={cn(
              "flex flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 outline-none",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
              isSelected ? "text-[var(--color-text-brand)]" : "text-[var(--color-text-muted)]",
            )}
          >
            <Icon name={item.icon} size={24} filled={isSelected} />
            {showLabels && (
              <Text variant="label-md" className="text-center">
                {item.label}
              </Text>
            )}
          </button>
        );
      })}
    </nav>
  );
}
