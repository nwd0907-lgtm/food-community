import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { TextVariant } from "../typography/Text";

// design.pen skeleton · Type(text, rectangle, circle), 뉴트럴(background-disabled)
// 텍스트형 높이 = 대상 타이포그래피의 행 높이(font-size × line-height 토큰)
const lineHeight: Record<TextVariant, string> = {
  "display-lg": "calc(var(--font-size-800) * var(--font-line-height-tight))",
  "display-md": "calc(var(--font-size-700) * var(--font-line-height-tight))",
  "display-sm": "calc(var(--font-size-600) * var(--font-line-height-tight))",
  "heading-lg": "calc(var(--font-size-500) * var(--font-line-height-tight))",
  "heading-md": "calc(var(--font-size-400) * var(--font-line-height-tight))",
  "heading-sm": "calc(var(--font-size-300) * var(--font-line-height-tight))",
  "body-lg": "calc(var(--font-size-300) * var(--font-line-height-normal))",
  "body-md": "calc(var(--font-size-200) * var(--font-line-height-normal))",
  "label-lg": "calc(var(--font-size-200) * var(--font-line-height-normal))",
  "label-md": "calc(var(--font-size-100) * var(--font-line-height-normal))",
};

type Length = number | string;

export type SkeletonProps =
  | { variant: "text"; typography?: TextVariant; width?: Length; className?: string }
  | { variant: "rectangle"; width: Length; height: Length; className?: string }
  | { variant: "circle"; size: Length; className?: string };

export function Skeleton(props: SkeletonProps) {
  let style: CSSProperties;
  let shape: string;
  if (props.variant === "text") {
    style = { width: props.width ?? "100%", height: lineHeight[props.typography ?? "body-lg"] };
    shape = "rounded";
  } else if (props.variant === "rectangle") {
    style = { width: props.width, height: props.height };
    shape = "rounded-lg";
  } else {
    style = { width: props.size, height: props.size };
    shape = "rounded-full";
  }

  return (
    <span
      aria-hidden
      data-variant={props.variant}
      style={style}
      className={cn("block animate-pulse bg-[var(--color-background-disabled)]", shape, props.className)}
    />
  );
}
