"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { BottomSheet } from "../bottom-sheet/BottomSheet";
import {
  fieldBoxClasses,
  fieldIconSize,
  fieldSizeClasses,
  helperColor,
  resolveFieldState,
  type FieldSize,
} from "../field/field";
import { Icon } from "../icon/Icon";
import { Text } from "../typography/Text";
import { SelectItem } from "./SelectItem";

// design.pen Select Foundation · State × Size. 패널이 열려 있는 동안 focused 유지.
// 데스크톱(dropdown): 셀렉트 아래 셀렉트아이템 / 모바일(sheet): 바텀시트 안 셀렉트아이템
export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = {
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: FieldSize;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  presentation?: "dropdown" | "sheet";
  /** 처음부터 패널을 연 상태로 렌더(문서·시안 비교용) */
  defaultOpen?: boolean;
  /** 패널 없이 focused 스타일만 강제 표시(문서·시안 비교용) */
  focused?: boolean;
  className?: string;
};

export function Select({
  label,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "선택하세요",
  size = "md",
  helperText,
  errorMessage,
  disabled,
  presentation = "dropdown",
  defaultOpen = false,
  focused,
  className,
}: SelectProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(defaultOpen && !disabled);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = value ?? internal;
  const selectedOption = options.find((o) => o.value === selected);
  const state = resolveFieldState({ disabled, error: !!errorMessage, focused: open || focused });
  const helper = errorMessage ?? helperText;

  useEffect(() => {
    if (!open || presentation !== "dropdown") return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, presentation]);

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    setInternal(option.value);
    onChange?.(option.value);
    setOpen(false);
  };

  const openPanel = () => {
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === selected)));
    setOpen(true);
  };

  const move = (step: 1 | -1) => {
    let next = activeIndex;
    for (let i = 0; i < options.length; i++) {
      next = (next + step + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openPanel();
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if ((event.key === "Enter" || event.key === " ") && options[activeIndex]) {
      event.preventDefault();
      choose(options[activeIndex]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    }
  };

  const items = (
    <ul
      id={`${id}-listbox`}
      role="listbox"
      aria-labelledby={`${id}-label`}
      className="flex flex-col gap-1"
    >
      {options.map((option, index) => (
        <SelectItem
          key={option.value}
          id={`${id}-option-${index}`}
          label={option.label}
          size={size}
          selected={option.value === selected}
          disabled={option.disabled}
          active={presentation === "dropdown" && index === activeIndex}
          onClick={() => choose(option)}
        />
      ))}
    </ul>
  );

  return (
    <div ref={rootRef} className={cn("relative flex w-full flex-col gap-1.5", className)}>
      <Text variant="label-lg" as="span" id={`${id}-label`}>
        {label}
      </Text>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-listbox` : undefined}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-activedescendant={open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
        aria-invalid={state === "error" || undefined}
        aria-describedby={helper ? `${id}-helper` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex w-full items-center gap-2 px-3 text-left outline-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          fieldSizeClasses[size],
          fieldBoxClasses(state),
        )}
      >
        <Text
          variant="body-lg"
          as="span"
          id={`${id}-value`}
          className={cn(
            "min-w-0 flex-1 truncate",
            disabled
              ? "text-[var(--color-text-disabled)]"
              : selectedOption
                ? "text-[var(--color-text-default)]"
                : "text-[var(--color-text-disabled)]",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </Text>
        <Icon
          name="chevron-down"
          size={fieldIconSize[size]}
          className={cn(
            "transition-transform",
            open && "rotate-180",
            disabled ? "text-[var(--color-text-disabled)]" : "text-[var(--color-text-default)]",
          )}
        />
      </button>
      {helper && (
        <Text variant="label-md" id={`${id}-helper`} className={helperColor(state)}>
          {helper}
        </Text>
      )}
      {open && presentation === "dropdown" && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 rounded-xl bg-[var(--color-background-surface)] p-1 shadow-[0_8px_24px_rgb(0_0_0/0.08)]">
          {items}
        </div>
      )}
      {presentation === "sheet" && (
        <BottomSheet open={open} onClose={() => setOpen(false)} title={label}>
          {items}
        </BottomSheet>
      )}
    </div>
  );
}
