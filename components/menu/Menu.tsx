"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { BottomSheet } from "../bottom-sheet/BottomSheet";
import type { IconName } from "../icon/Icon";
import { IconButton } from "../icon-button/IconButton";
import { MenuItem, type MenuItemSize } from "./MenuItem";

// design.pen menu/default: 240 폭, surface 배경, border-default, 상하 패딩 8
// 데스크톱(dropdown): 메뉴버튼 아래 / 모바일(sheet): 바텀시트 안 메뉴아이템
export type MenuAction = {
  label: string;
  icon?: IconName;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onSelect?: () => void;
};

export type MenuListProps = {
  items: MenuAction[];
  size?: MenuItemSize;
  onItemSelect?: (item: MenuAction) => void;
  /** 바텀시트 안에서는 테두리 없는 리스트로 표시 */
  bare?: boolean;
  className?: string;
  label?: string;
};

/** 메뉴 패널(메뉴아이템 목록) */
export function MenuList({ items, size = "md", onItemSelect, bare, className, label }: MenuListProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const buttons = [...(ref.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? [])];
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "flex flex-col",
        !bare &&
          "w-60 rounded-xl bg-[var(--color-background-surface)] py-2 shadow-[inset_0_0_0_1px_var(--color-border-default)]",
        className,
      )}
    >
      {items.map((item) => (
        <MenuItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          variant={item.variant}
          disabled={item.disabled}
          size={size}
          onClick={() => {
            item.onSelect?.();
            onItemSelect?.(item);
          }}
        />
      ))}
    </div>
  );
}

export type MenuProps = {
  items: MenuAction[];
  /** 메뉴버튼(아이콘 버튼) */
  triggerLabel?: string;
  triggerIcon?: IconName;
  size?: MenuItemSize;
  presentation?: "dropdown" | "sheet";
  align?: "start" | "end";
  defaultOpen?: boolean;
  /** 바텀시트 제목 */
  sheetTitle?: string;
  className?: string;
};

export function Menu({
  items,
  triggerLabel = "더보기",
  triggerIcon = "more-vertical",
  size = "md",
  presentation = "dropdown",
  align = "end",
  defaultOpen = false,
  sheetTitle,
  className,
}: MenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || presentation !== "dropdown") return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, presentation]);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <IconButton
        label={triggerLabel}
        icon={triggerIcon}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
      {open && presentation === "dropdown" && (
        <MenuList
          items={items}
          size={size}
          label={triggerLabel}
          onItemSelect={() => setOpen(false)}
          className={cn("absolute top-full z-20 mt-1", align === "end" ? "right-0" : "left-0")}
        />
      )}
      {presentation === "sheet" && (
        <BottomSheet open={open} onClose={() => setOpen(false)} title={sheetTitle}>
          <MenuList items={items} size={size} label={triggerLabel} bare onItemSelect={() => setOpen(false)} />
        </BottomSheet>
      )}
    </div>
  );
}
