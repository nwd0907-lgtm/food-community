"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import {
  fieldBoxClasses,
  fieldHeightClasses,
  fieldIconSize,
  fieldSizeClasses,
  helperColor,
  resolveFieldState,
  type FieldSize,
  type FieldTone,
} from "../field/field";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen Text Field Foundation · Type(text, password) × State × Size
export type TextFieldProps = {
  label: string;
  type?: "text" | "password";
  size?: FieldSize;
  /** 힌트. errorMessage가 있으면 대체된다 */
  helperText?: string;
  /** 값이 있으면 error 상태 */
  errorMessage?: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** 있으면 trailingIcon을 버튼으로 렌더(예: 입력 지우기) */
  onTrailingIconClick?: () => void;
  /** trailingIcon 버튼의 접근성 이름 */
  trailingIconLabel?: string;
  /** 레이블을 시각적으로 숨김(접근성 이름은 유지). 예: 검색 필드 */
  hideLabel?: boolean;
  /** pill: 완전한 라운드(검색 필드) */
  shape?: "default" | "pill";
  /** brand: 테두리(1px) · 아이콘 · 플레이스홀더를 브랜드색으로 (메인 검색) */
  tone?: FieldTone;
  /** 포커스 스타일 강제 표시(문서·시안 비교용). 실제 포커스 시에는 자동 적용 */
  focused?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">;

export function TextField({
  label,
  type = "text",
  size = "md",
  helperText,
  errorMessage,
  leadingIcon,
  trailingIcon,
  onTrailingIconClick,
  trailingIconLabel,
  hideLabel,
  shape = "default",
  tone = "default",
  focused,
  required,
  disabled,
  id,
  className,
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const state = resolveFieldState({ disabled, error: !!errorMessage, focused });
  const helper = errorMessage ?? helperText;
  const iconColor =
    state === "disabled"
      ? "text-[var(--color-text-disabled)]"
      : tone === "brand" && state !== "error"
        ? "text-[var(--color-text-brand)]"
        : "text-[var(--color-text-default)]";

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <Text variant="label-lg" as="label" htmlFor={inputId} className={cn(hideLabel && "sr-only")}>
        {label}
        {required && (
          <span aria-hidden className="ml-[3px] text-[var(--color-text-error)]">
            *
          </span>
        )}
      </Text>
      <div
        className={cn(
          "flex items-center gap-2 px-3",
          shape === "pill" ? cn(fieldHeightClasses[size], "rounded-full") : fieldSizeClasses[size],
          fieldBoxClasses(state, tone),
        )}
      >
        {leadingIcon && <Icon name={leadingIcon} size={fieldIconSize[size]} className={iconColor} />}
        {/* 입력 글자 · 플레이스홀더는 14px(body-md) */}
        <Text
          variant="body-md"
          as="input"
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={state === "error" || undefined}
          aria-required={required || undefined}
          aria-describedby={helper ? helperId : undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none",
            tone === "brand"
              ? "placeholder:text-[var(--color-text-brand)]"
              : "placeholder:text-[var(--color-text-disabled)]",
            "disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)]",
          )}
          {...props}
        />
        {trailingIcon &&
          (onTrailingIconClick ? (
            <button
              type="button"
              aria-label={trailingIconLabel}
              disabled={disabled}
              onClick={onTrailingIconClick}
              className={cn(
                "-m-1 inline-flex shrink-0 cursor-pointer rounded-full p-1 disabled:cursor-not-allowed",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-border-brand)]",
                iconColor,
              )}
            >
              <Icon name={trailingIcon} size={fieldIconSize[size]} />
            </button>
          ) : (
            <Icon name={trailingIcon} size={fieldIconSize[size]} className={iconColor} />
          ))}
      </div>
      {helper && (
        <Text variant="label-md" id={helperId} className={helperColor(state)}>
          {helper}
        </Text>
      )}
    </div>
  );
}
