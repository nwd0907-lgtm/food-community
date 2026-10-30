"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Text } from "../typography/Text";

// design.pen navigation/tab/3-items: 높이 48, 아이템 2개 이상 균등 분배, 레이블 label-lg, 선택 시 하단 2px 인디케이터
// 비활성 아이템: 레이블 text-disabled + 투명도 0.4, 선택·키보드 이동 대상에서 제외 (design.pen 마이페이지 "구매 내역")
export type TabItem = { value: string; label: string; disabled?: boolean };

export type TabNavigationProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 탭 목록의 접근성 이름 */
  label?: string;
  className?: string;
};

export function TabNavigation({ items, value, defaultValue, onChange, label, className }: TabNavigationProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const selected = value ?? internal;

  const select = (next: string) => {
    setInternal(next);
    onChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const index = enabled.findIndex((item) => item.value === selected);
    const next = enabled[(index + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length];
    select(next.value);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "flex h-12 w-full bg-[var(--color-background-surface)] shadow-[inset_0_-1px_0_var(--color-border-default)]",
        className,
      )}
    >
      {items.map((item) => {
        const isSelected = item.value === selected;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-value={item.value}
            aria-selected={isSelected}
            disabled={item.disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => select(item.value)}
            className={cn(
              "flex flex-1 cursor-pointer flex-col outline-none disabled:cursor-not-allowed disabled:opacity-40",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
            )}
          >
            <span className="flex flex-1 items-center justify-center">
              <Text
                variant="label-lg"
                className={
                  item.disabled
                    ? "text-[var(--color-text-disabled)]"
                    : isSelected
                      ? "text-[var(--color-text-brand)]"
                      : "text-[var(--color-text-default)]"
                }
              >
                {item.label}
              </Text>
            </span>
            <span className={cn("h-0.5 w-full", isSelected && "bg-[var(--color-background-brand)]")} />
          </button>
        );
      })}
    </div>
  );
}
