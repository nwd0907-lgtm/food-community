"use client";

import { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useOverlay } from "@/lib/useOverlay";
import { Text } from "../typography/Text";

// design.pen bottom-sheet/default: 상단 드래그 핸들 + 콘텐츠, 배경 스크림 탭 시 선택 없이 닫힘
export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function BottomSheet({ open, onClose, title, description, children, className }: BottomSheetProps) {
  const panelRef = useOverlay<HTMLDivElement>(open, onClose);
  const titleId = useId();
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        data-testid="bottom-sheet-scrim"
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-background-inverse)] opacity-55"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex w-full flex-col rounded-t-[20px] bg-[var(--color-background-surface)] pb-6 outline-none",
          className,
        )}
      >
        <div className="flex h-8 items-center justify-center">
          <span className="h-1 w-10 rounded-sm bg-[var(--color-border-strong)]" />
        </div>
        <div className="flex flex-col gap-3 px-6">
          {title && (
            <Text variant="heading-sm" id={titleId}>
              {title}
            </Text>
          )}
          {description && (
            <Text variant="body-md" className="text-[var(--color-text-muted)]">
              {description}
            </Text>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
