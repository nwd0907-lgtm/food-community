"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { Button } from "../button/Button";
import { Icon, type IconName } from "../icon/Icon";
import { IconButton } from "../icon-button/IconButton";
import { Text } from "../typography/Text";

// design.pen File Uploader Foundation: 드롭존 + 파일선택버튼 결합 단일형
// 드롭존 상태: default, dragover, disabled, error / 파일아이템 상태: uploading, complete, error
export type UploadStatus = "uploading" | "complete" | "error";

export type UploadFile = {
  id: string;
  name: string;
  status: UploadStatus;
  /** 상태 문구. 없으면 상태별 기본 문구 */
  statusText?: string;
  thumbnailUrl?: string;
};

const statusIcon: Record<UploadStatus, { icon: IconName; className: string }> = {
  uploading: { icon: "loader-circle", className: "animate-spin text-[var(--color-text-brand)]" },
  complete: { icon: "check", className: "text-[var(--color-text-brand)]" },
  error: { icon: "error", className: "text-[var(--color-text-error)]" },
};

const defaultStatusText: Record<UploadStatus, string> = {
  uploading: "업로드 중",
  complete: "업로드 완료",
  error: "업로드 실패",
};

export type FileItemProps = {
  file: UploadFile;
  onRemove?: (id: string) => void;
  disabled?: boolean;
};

export function FileItem({ file, onRemove, disabled }: FileItemProps) {
  const isError = file.status === "error";
  const textColor = disabled
    ? "text-[var(--color-text-disabled)]"
    : isError
      ? "text-[var(--color-text-error)]"
      : undefined;
  const status = disabled ? { icon: statusIcon[file.status].icon, className: "text-[var(--color-text-disabled)]" } : statusIcon[file.status];

  return (
    <li
      className={cn(
        "flex h-16 items-center gap-2.5 rounded-xl bg-[var(--color-background-surface)] p-2",
        isError && !disabled
          ? "shadow-[inset_0_0_0_1px_var(--color-border-error)]"
          : "shadow-[inset_0_0_0_1px_var(--color-border-default)]",
      )}
    >
      <span
        aria-hidden
        className="size-[46px] shrink-0 rounded-lg bg-[var(--color-background-map-land)] bg-cover bg-center"
        style={file.thumbnailUrl ? { backgroundImage: `url(${file.thumbnailUrl})` } : undefined}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <Text variant="body-md" className={cn("truncate", textColor)}>
          {file.name}
        </Text>
        <Text variant="label-md" className={textColor ?? "text-[var(--color-text-muted)]"}>
          {file.statusText ?? defaultStatusText[file.status]}
        </Text>
      </div>
      <Icon name={status.icon} size={20} className={status.className} label={defaultStatusText[file.status]} />
      <IconButton
        size="sm"
        icon="close"
        label={`${file.name} 삭제`}
        disabled={disabled}
        onClick={() => onRemove?.(file.id)}
      />
    </li>
  );
}

const dropzoneMessage = {
  default: "파일을 끌어오거나 직접 선택하세요",
  dragover: "여기에 파일을 놓아 주세요",
  disabled: "업로드할 수 없어요",
} as const;

export type FileUploaderProps = {
  /** 파일 형식·용량 제한 안내 */
  helperText?: string;
  files?: UploadFile[];
  onFilesSelected?: (files: File[]) => void;
  onRemove?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** 있으면 드롭존 error 상태 + 안내문구 대체 */
  errorMessage?: string;
  /** dragover 스타일 강제 표시(문서·시안 비교용). 실제 드래그 시에는 자동 적용 */
  dragOver?: boolean;
  buttonLabel?: string;
  /** default 상태 드롭존 문구 대체(예: 남은 개수 안내) */
  message?: string;
  className?: string;
};

export function FileUploader({
  helperText,
  files = [],
  onFilesSelected,
  onRemove,
  accept,
  multiple,
  disabled,
  errorMessage,
  dragOver: forcedDragOver,
  buttonLabel = "파일 선택",
  message,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const helperId = useId();
  const [dragging, setDragging] = useState(false);
  const state = disabled ? "disabled" : (forcedDragOver ?? dragging) ? "dragover" : errorMessage ? "error" : "default";

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = [...event.dataTransfer.files];
    if (dropped.length) onFilesSelected?.(multiple ? dropped : dropped.slice(0, 1));
  };

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      {helperText && (
        <Text variant="label-md" id={helperId} className="text-[var(--color-text-muted)]">
          {helperText}
        </Text>
      )}
      <div
        data-state={state}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex h-[150px] flex-col items-center justify-center gap-2.5 rounded-[14px] px-4",
          state === "disabled"
            ? "bg-[var(--color-background-disabled)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
            : "bg-[var(--color-background-surface)]",
          state === "default" && "shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
          state === "dragover" && "shadow-[inset_0_0_0_2px_var(--color-border-brand)]",
          state === "error" && "shadow-[inset_0_0_0_1px_var(--color-border-error)]",
        )}
      >
        <Icon
          name="image"
          size={24}
          className={
            state === "disabled"
              ? "text-[var(--color-text-disabled)]"
              : state === "error"
                ? "text-[var(--color-text-error)]"
                : "text-[var(--color-text-brand)]"
          }
        />
        <Text
          variant="body-md"
          role={state === "error" ? "alert" : undefined}
          className={cn(
            "text-center",
            state === "disabled"
              ? "text-[var(--color-text-disabled)]"
              : state === "error"
                ? "text-[var(--color-text-error)]"
                : "text-[var(--color-text-default)]",
          )}
        >
          {state === "error" ? errorMessage : state === "default" && message ? message : dropzoneMessage[state]}
        </Text>
        <Button size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
          {buttonLabel}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={helperText ? helperId : undefined}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const selected = [...(event.target.files ?? [])];
            if (selected.length) onFilesSelected?.(selected);
            event.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <FileItem key={file.id} file={file} onRemove={onRemove} disabled={disabled} />
          ))}
        </ul>
      )}
    </div>
  );
}
