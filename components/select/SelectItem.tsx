import type { LiHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldIconSize, fieldSizeClasses, type FieldSize } from "../field/field";
import { Icon } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen Select Item Foundation · State(default, selected, disabled) × Size — 참조하는 셀렉트의 사이즈를 따른다
export type SelectItemProps = {
  label: string;
  size?: FieldSize;
  selected?: boolean;
  disabled?: boolean;
  /** 키보드로 가리키고 있는 항목 */
  active?: boolean;
} & Omit<LiHTMLAttributes<HTMLLIElement>, "children">;

export function SelectItem({ label, size = "md", selected, disabled, active, className, ...props }: SelectItemProps) {
  return (
    <li
      role="option"
      aria-selected={!!selected}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex items-center gap-2 px-3",
        fieldSizeClasses[size],
        disabled
          ? "cursor-not-allowed bg-[var(--color-background-disabled)] text-[var(--color-text-disabled)] shadow-[inset_0_0_0_1px_var(--color-border-default)]"
          : selected
            ? "cursor-pointer bg-[var(--color-background-brand)] text-[var(--color-text-on-brand)] shadow-[inset_0_0_0_1px_var(--color-border-brand)]"
            : "cursor-pointer bg-[var(--color-background-surface)] text-[var(--color-text-default)] shadow-[inset_0_0_0_1px_var(--color-border-default)]",
        active && !disabled && "outline-2 -outline-offset-2 outline-[var(--color-border-brand)]",
        className,
      )}
      {...props}
    >
      <Text variant="body-lg" as="span" className="min-w-0 flex-1 truncate">
        {label}
      </Text>
      {selected && <Icon name="check" size={fieldIconSize[size]} />}
    </li>
  );
}
