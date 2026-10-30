import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen menu-item · Type(default, destructive) × State(default, disabled) × Size — 참조하는 메뉴의 사이즈를 따른다
const sizeClasses = { sm: "h-8", md: "h-10", lg: "h-12" } as const;
const iconSize = { sm: 16, md: 20, lg: 20 } as const;

export type MenuItemSize = keyof typeof sizeClasses;

export type MenuItemProps = {
  label: string;
  icon?: IconName;
  variant?: "default" | "destructive";
  size?: MenuItemSize;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function MenuItem({
  label,
  icon,
  variant = "default",
  size = "md",
  disabled,
  className,
  ...props
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 bg-[var(--color-background-surface)] px-3 text-left outline-none",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
        sizeClasses[size],
        disabled
          ? "cursor-not-allowed text-[var(--color-text-disabled)]"
          : variant === "destructive"
            ? "cursor-pointer text-[var(--color-text-error)]"
            : "cursor-pointer text-[var(--color-text-default)]",
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} size={iconSize[size]} />}
      <Text variant="body-lg" as="span" className="min-w-0 flex-1 truncate">
        {label}
      </Text>
    </button>
  );
}
