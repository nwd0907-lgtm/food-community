"use client";

import { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useOverlay } from "@/lib/useOverlay";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen modal/default: 헤더(제목 + 닫기 16) · 바디 · 푸터(secondary + primary), 스크림 탭 시 닫힘
type ModalAction = { label: string; onClick: () => void };

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  className?: string;
};

export function Modal({ open, onClose, title, children, primaryAction, secondaryAction, className }: ModalProps) {
  const panelRef = useOverlay<HTMLDivElement>(open, onClose);
  const titleId = useId();
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        data-testid="modal-scrim"
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-[var(--color-background-inverse)] opacity-55"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative flex w-full max-w-[380px] flex-col rounded-2xl bg-[var(--color-background-surface)] outline-none",
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 pt-[18px] pb-3">
          <Text variant="heading-sm" as="h2" id={titleId} className="flex-1">
            {title}
          </Text>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[var(--color-border-brand)]"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        {children && (
          <div className="px-5 pb-5">
            <Text variant="body-md" as="div" className="text-[var(--color-text-muted)]">
              {children}
            </Text>
          </div>
        )}
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center justify-end gap-2 px-5 pb-5">
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
