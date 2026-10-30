import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen toast · Type(success, error, info, warning). 모바일: 화면 너비 - 좌우 마진 / 데스크톱: 400px
const typeStyles: Record<ToastType, { bg: string; icon: IconName }> = {
  success: { bg: "bg-[var(--color-text-success)]", icon: "badge-check" },
  error: { bg: "bg-[var(--color-text-error)]", icon: "error" },
  info: { bg: "bg-[var(--color-text-info)]", icon: "info" },
  warning: { bg: "bg-[var(--color-text-warning)]", icon: "warning" },
};

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastProps = {
  type: ToastType;
  message: string;
  /** 있으면 우측 닫기 아이콘 표시 */
  onClose?: () => void;
  className?: string;
};

export function Toast({ type, message, onClose, className }: ToastProps) {
  const { bg, icon } = typeStyles[type];
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-2 text-[var(--color-text-on-strong)] md:w-[400px]",
        bg,
        className,
      )}
    >
      <Icon name={icon} size={20} />
      <Text variant="body-md" className="min-w-0 flex-1">
        {message}
      </Text>
      {onClose && (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-current"
        >
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
