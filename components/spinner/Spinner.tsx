import { cn } from "@/lib/cn";
import { Icon } from "../icon/Icon";

// design.pen spinner/md: loader-circle 24, color-text-brand
export type SpinnerProps = {
  /** 스크린리더용 상태 문구 */
  label?: string;
  className?: string;
};

export function Spinner({ label = "로딩 중", className }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex size-6 items-center justify-center", className)}>
      <Icon name="loader-circle" size={24} className="animate-spin text-[var(--color-text-brand)]" />
    </span>
  );
}
