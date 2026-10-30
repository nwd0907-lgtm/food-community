"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { Text } from "../typography/Text";

// design.pen Radio Foundation · Selection(unselected, selected) × State(default, disabled) × Size(sm 16, md 20)
// 단독 사용 금지 → 그룹 컴포넌트로만 제공한다.
const ringSize = { sm: "size-4", md: "size-5" } as const;
const dotSize = { sm: "size-2", md: "size-2.5" } as const;

export type RadioSize = keyof typeof ringSize;

export type RadioOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type RadioGroupProps = {
  /** 그룹 이름(접근성 레이블) */
  label: string;
  /** 시각적으로 그룹 레이블을 숨길지 */
  hideLabel?: boolean;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: RadioSize;
  disabled?: boolean;
  name?: string;
  direction?: "vertical" | "horizontal";
  className?: string;
};

export function RadioGroup({
  label,
  hideLabel,
  options,
  value,
  defaultValue,
  onChange,
  size = "md",
  disabled,
  name,
  direction = "vertical",
  className,
}: RadioGroupProps) {
  const autoName = useId();
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;

  return (
    <fieldset className={cn("flex gap-3", direction === "vertical" ? "flex-col" : "flex-row flex-wrap", className)}>
      <Text variant="label-lg" as="legend" className={cn("mb-1", hideLabel && "sr-only")}>
        {label}
      </Text>
      {options.map((option) => {
        const isDisabled = disabled || option.disabled;
        const isSelected = selected === option.value;
        return (
          <label
            key={option.value}
            className={cn("inline-flex items-center gap-2", isDisabled ? "cursor-not-allowed" : "cursor-pointer")}
          >
            <span className="relative inline-flex">
              <input
                type="radio"
                name={name ?? autoName}
                value={option.value}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => {
                  setInternal(option.value);
                  onChange?.(option.value);
                }}
                className="peer absolute inset-0 m-0 cursor-[inherit] opacity-0"
              />
              <span
                aria-hidden
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full bg-[var(--color-background-surface)]",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-border-brand)]",
                  ringSize[size],
                  isSelected
                    ? "shadow-[inset_0_0_0_2px_var(--color-border-brand)]"
                    : isDisabled
                      ? "shadow-[inset_0_0_0_1.5px_var(--color-border-default)]"
                      : "shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]",
                )}
              >
                {isSelected && (
                  <span
                    className={cn(
                      "rounded-full",
                      dotSize[size],
                      isDisabled ? "bg-[var(--color-background-disabled)]" : "bg-[var(--color-background-brand)]",
                    )}
                  />
                )}
              </span>
            </span>
            <Text
              variant="body-md"
              as="span"
              className={isDisabled ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-default)]"}
            >
              {option.label}
            </Text>
          </label>
        );
      })}
    </fieldset>
  );
}
