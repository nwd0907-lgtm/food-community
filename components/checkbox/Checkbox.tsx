"use client";

import { createContext, useContext, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Text } from "../typography/Text";

// design.pen Checkbox Foundation · Selection(unchecked, checked, indeterminate) × State(default, disabled, error) × Size(sm 16, md 20)
const boxSize = { sm: "size-4 rounded", md: "size-5 rounded-[5px]" } as const;
const markSize = { sm: 10, md: 14 } as const;
const barSize = { sm: "w-[9px]", md: "w-[13px]" } as const;

export type CheckboxSize = keyof typeof boxSize;

const GroupContext = createContext<{ error: boolean; size?: CheckboxSize; disabled?: boolean } | null>(null);

export type CheckboxProps = {
  label: ReactNode;
  size?: CheckboxSize;
  indeterminate?: boolean;
  /** 단독 사용 시 error 표시. 그룹 안에서는 CheckboxGroup의 errorMessage를 따른다 */
  error?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">;

export function Checkbox({
  label,
  size: sizeProp,
  indeterminate = false,
  error: errorProp,
  disabled: disabledProp,
  checked,
  className,
  ...props
}: CheckboxProps) {
  const group = useContext(GroupContext);
  const size = sizeProp ?? group?.size ?? "md";
  const disabled = disabledProp ?? group?.disabled;
  const error = !disabled && (errorProp ?? group?.error ?? false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  // 미선택 / 선택 상태별 박스 색 (선택 여부는 peer-checked, indeterminate는 prop으로 판단)
  const on = indeterminate || undefined;
  const boxClasses = disabled
    ? cn(
        "shadow-[inset_0_0_0_1.5px_var(--color-border-default)]",
        on ? "bg-[var(--color-background-disabled)]" : "bg-[var(--color-background-surface)] peer-checked:bg-[var(--color-background-disabled)]",
        "text-[var(--color-text-disabled)]",
      )
    : cn(
        "text-[var(--color-text-on-brand)]",
        on
          ? "bg-[var(--color-background-brand)]"
          : "bg-[var(--color-background-surface)] peer-checked:bg-[var(--color-background-brand)]",
        error
          ? "shadow-[inset_0_0_0_1.5px_var(--color-border-error)]"
          : on
            ? "shadow-[inset_0_0_0_1.5px_var(--color-border-brand)]"
            : "shadow-[inset_0_0_0_1.5px_var(--color-border-strong)] peer-checked:shadow-[inset_0_0_0_1.5px_var(--color-border-brand)]",
      );

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <span className="relative inline-flex">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-checked={indeterminate ? "mixed" : undefined}
          className="peer absolute inset-0 m-0 cursor-[inherit] opacity-0"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "group/box flex shrink-0 items-center justify-center",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-border-brand)]",
            boxSize[size],
            boxClasses,
          )}
        >
          {indeterminate ? (
            <span className={cn("h-0.5 rounded-[1px] bg-current", barSize[size])} />
          ) : (
            <svg
              viewBox="0 0 10 9"
              width={markSize[size]}
              height={markSize[size]}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hidden [:checked+*>&]:block"
            >
              <path d="M1 5l3 3 5-7" />
            </svg>
          )}
        </span>
      </span>
      <Text
        variant="body-md"
        as="span"
        className={
          disabled
            ? "text-[var(--color-text-disabled)]"
            : error
              ? "text-[var(--color-text-error)]"
              : "text-[var(--color-text-default)]"
        }
      >
        {label}
      </Text>
    </label>
  );
}

export type CheckboxGroupProps = {
  legend?: string;
  /** 그룹 전체 아래에 한 번만 표시 */
  errorMessage?: string;
  size?: CheckboxSize;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export function CheckboxGroup({ legend, errorMessage, size, disabled, children, className }: CheckboxGroupProps) {
  const errorId = useId();
  return (
    <fieldset
      aria-describedby={errorMessage ? errorId : undefined}
      aria-invalid={!!errorMessage || undefined}
      className={cn("flex flex-col gap-3", className)}
    >
      {legend && (
        <Text variant="label-lg" as="legend" className="mb-1">
          {legend}
        </Text>
      )}
      <GroupContext.Provider value={{ error: !!errorMessage, size, disabled }}>{children}</GroupContext.Provider>
      {errorMessage && (
        <Text variant="label-md" id={errorId} className="text-[var(--color-text-error)]">
          {errorMessage}
        </Text>
      )}
    </fieldset>
  );
}
