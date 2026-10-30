import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Text } from "../typography/Text";

// design.pen badge · Type(neutral, success, error, info, warning) × Size(md 20, lg 24), 좌우 패딩 8
const toneClasses = {
  neutral: "bg-[var(--color-background-strong)]",
  success: "bg-[var(--color-text-success)]",
  error: "bg-[var(--color-text-error)]",
  info: "bg-[var(--color-text-info)]",
  warning: "bg-[var(--color-text-warning)]",
} as const;

const sizeClasses = { md: "h-5 rounded-[10px]", lg: "h-6 rounded-xl" } as const;

export type BadgeTone = keyof typeof toneClasses;

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  size?: keyof typeof sizeClasses;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

export function Badge({ label, tone = "neutral", size = "md", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center px-2 text-[var(--color-text-on-strong)]",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <Text variant="label-md" className="text-center whitespace-nowrap">
        {label}
      </Text>
    </span>
  );
}
