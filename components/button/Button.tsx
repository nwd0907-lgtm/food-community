import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen Button Foundation · Type × State × Size
const typeClasses = {
  primary: "bg-[var(--color-background-brand)] text-[var(--color-text-on-brand)]",
  secondary:
    "bg-[var(--color-background-default)] text-[var(--color-text-default)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
  destructive: "bg-[var(--color-background-error-strong)] text-[var(--color-text-on-strong)]",
} as const;

const disabledClasses = {
  primary: "bg-[var(--color-background-disabled)] text-[var(--color-text-disabled)]",
  secondary:
    "bg-[var(--color-background-default)] text-[var(--color-text-disabled)] shadow-[inset_0_0_0_1px_var(--color-border-default)]",
  destructive: "bg-[var(--color-background-disabled)] text-[var(--color-text-disabled)]",
} as const;

const sizeClasses = {
  sm: "h-8 rounded-lg px-3",
  md: "h-10 rounded-[10px] px-4",
  lg: "h-12 rounded-xl px-5",
} as const;

const iconSize = { sm: 16, md: 20, lg: 20 } as const;

export type ButtonType = keyof typeof typeClasses;
export type ButtonSize = keyof typeof sizeClasses;

export type ButtonProps = {
  variant?: ButtonType;
  size?: ButtonSize;
  /** 좌측 아이콘을 스피너로 바꾸고 레이블은 유지 */
  loading?: boolean;
  /** 아이콘 이름, 또는 아이콘 세트에 없는 그래픽(예: Google 로고) 요소 */
  leadingIcon?: IconName | ReactElement;
  trailingIcon?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
        sizeClasses[size],
        disabled ? disabledClasses[variant] : typeClasses[variant],
        disabled ? "cursor-not-allowed" : loading ? "cursor-progress" : "cursor-pointer",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Icon name="loader-circle" size={iconSize[size]} className="animate-spin" />
      ) : (
        leadingIcon &&
        (typeof leadingIcon === "string" ? <Icon name={leadingIcon} size={iconSize[size]} /> : leadingIcon)
      )}
      <Text variant="label-lg" as="span">
        {children}
      </Text>
      {trailingIcon && <Icon name={trailingIcon} size={iconSize[size]} />}
    </button>
  );
}
