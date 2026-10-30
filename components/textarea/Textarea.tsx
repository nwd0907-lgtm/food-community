"use client";

import { useId, useState, type ChangeEvent, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldBoxClasses, helperColor, resolveFieldState } from "../field/field";
import { Text } from "../typography/Text";

// design.pen Textarea Foundation · State. 고정 높이 3줄(96px), 초과 시 스크롤
export type TextareaProps = {
  label: string;
  helperText?: string;
  errorMessage?: string;
  /** 하단 우측 글자수 카운터 표시 (maxLength가 있으면 "n / max") */
  showCounter?: boolean;
  focused?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  label,
  helperText,
  errorMessage,
  showCounter,
  focused,
  required,
  disabled,
  id,
  value,
  defaultValue,
  maxLength,
  onChange,
  className,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const helperId = `${textareaId}-helper`;
  const state = resolveFieldState({ disabled, error: !!errorMessage, focused });
  const helper = errorMessage ?? helperText;
  const [uncontrolledLength, setUncontrolledLength] = useState(String(defaultValue ?? "").length);
  const length = value !== undefined ? String(value).length : uncontrolledLength;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) setUncontrolledLength(event.target.value.length);
    onChange?.(event);
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <Text variant="label-lg" as="label" htmlFor={textareaId}>
        {label}
        {required && (
          <span aria-hidden className="ml-[3px] text-[var(--color-text-error)]">
            *
          </span>
        )}
      </Text>
      <div className={cn("h-24 rounded-xl p-3", fieldBoxClasses(state))}>
        {/* 입력 글자 · 플레이스홀더는 14px(body-md) */}
        <Text
          variant="body-md"
          as="textarea"
          id={textareaId}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={handleChange}
          aria-invalid={state === "error" || undefined}
          aria-required={required || undefined}
          aria-describedby={helper ? helperId : undefined}
          className={cn(
            "block size-full resize-none overflow-y-auto bg-transparent outline-none",
            "placeholder:text-[var(--color-text-disabled)] disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)]",
          )}
          {...props}
        />
      </div>
      {(helper || showCounter) && (
        <div className="flex justify-between gap-2">
          <Text variant="label-md" id={helperId} className={helperColor(state)}>
            {helper}
          </Text>
          {showCounter && (
            <Text
              variant="label-md"
              aria-live="polite"
              className={state === "error" ? "text-[var(--color-text-error)]" : "text-[var(--color-text-muted)]"}
            >
              {maxLength ? `${length} / ${maxLength}` : length}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
