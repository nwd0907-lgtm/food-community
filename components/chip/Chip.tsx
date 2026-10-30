"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen Chip Foundation · Selection(unselected, selected) × State(default, disabled) × Size(sm 24, md 32)
// 좌우 패딩: 좌측 아이콘 없음 sm 12 / md 16, 있음 sm 6 / md 8
const sizeClasses = {
  sm: { base: "h-6 rounded-xl", plain: "px-3", withIcon: "px-1.5" },
  md: { base: "h-8 rounded-2xl", plain: "px-4", withIcon: "px-2" },
} as const;

export type ChipSize = keyof typeof sizeClasses;

export type ChipProps = {
  label: string;
  icon?: IconName;
  size?: ChipSize;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function Chip({
  label,
  icon,
  size = "md",
  selected,
  defaultSelected = false,
  onSelectedChange,
  disabled,
  className,
  onClick,
  ...props
}: ChipProps) {
  const [internal, setInternal] = useState(defaultSelected);
  const on = selected ?? internal;

  const stateClasses = disabled
    ? cn(
        "cursor-not-allowed bg-[var(--color-background-disabled)] text-[var(--color-text-disabled)]",
        on ? "shadow-[inset_0_0_0_1px_var(--color-border-brand)]" : "shadow-[inset_0_0_0_1px_var(--color-border-default)]",
      )
    : on
      ? "cursor-pointer bg-[var(--color-background-brand)] text-[var(--color-text-on-brand)] shadow-[inset_0_0_0_1px_var(--color-border-brand)]"
      : "cursor-pointer bg-[var(--color-background-surface)] text-[var(--color-text-default)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]";

  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={(event) => {
        setInternal(!on);
        onSelectedChange?.(!on);
        onClick?.(event);
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
        sizeClasses[size].base,
        icon ? sizeClasses[size].withIcon : sizeClasses[size].plain,
        stateClasses,
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} size={16} />}
      <Text variant="label-lg" as="span" className="text-center">
        {label}
      </Text>
    </button>
  );
}
