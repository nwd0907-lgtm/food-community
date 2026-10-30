"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Text } from "../typography/Text";

// design.pen Switch Foundation · Selection(off, on) × State(default, disabled) × Size(sm 32×16, md 40×20)
const trackSize = { sm: "h-4 w-8", md: "h-5 w-10" } as const;
const thumbSize = { sm: "size-3", md: "size-4" } as const;

export type SwitchSize = keyof typeof trackSize;

export type SwitchProps = {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children">;

export function Switch({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = "md",
  disabled,
  className,
  onClick,
  ...props
}: SwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={(event) => {
        setInternal(!on);
        onCheckedChange?.(!on);
        onClick?.(event);
      }}
      className={cn(
        "group inline-flex items-center gap-2 text-left",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "flex shrink-0 items-center rounded-full p-0.5 transition-colors",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--color-border-brand)]",
          trackSize[size],
          on ? "justify-end" : "justify-start",
          on && !disabled ? "bg-[var(--color-background-brand)]" : "bg-[var(--color-background-disabled)]",
        )}
      >
        <span
          className={cn(
            "rounded-full",
            thumbSize[size],
            on && disabled ? "bg-[var(--color-text-disabled)]" : "bg-[var(--color-background-surface)]",
          )}
        />
      </span>
      <Text
        variant="body-md"
        as="span"
        className={disabled ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-default)]"}
      >
        {label}
      </Text>
    </button>
  );
}
