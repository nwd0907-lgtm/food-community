import type { ComponentPropsWithoutRef, ElementType } from "react";

// design.pen Typography Foundation: 사이즈 · 두께 · 행간 프리미티브 토큰 조합, 공통 자간 -2%
// 색상은 부모에서 상속(body 기본값 = color-text-default). 다른 색은 className으로 지정.
const variantClasses = {
  "display-lg":
    "text-[length:var(--font-size-800)] font-[number:var(--font-weight-bold)] leading-[var(--font-line-height-tight)]",
  "display-md":
    "text-[length:var(--font-size-700)] font-[number:var(--font-weight-bold)] leading-[var(--font-line-height-tight)]",
  "display-sm":
    "text-[length:var(--font-size-600)] font-[number:var(--font-weight-bold)] leading-[var(--font-line-height-tight)]",
  "heading-lg":
    "text-[length:var(--font-size-500)] font-[number:var(--font-weight-bold)] leading-[var(--font-line-height-tight)]",
  "heading-md":
    "text-[length:var(--font-size-400)] font-[number:var(--font-weight-bold)] leading-[var(--font-line-height-tight)]",
  "heading-sm":
    "text-[length:var(--font-size-300)] font-[number:var(--font-weight-semibold)] leading-[var(--font-line-height-tight)]",
  "body-lg":
    "text-[length:var(--font-size-300)] font-[number:var(--font-weight-regular)] leading-[var(--font-line-height-normal)]",
  "body-md":
    "text-[length:var(--font-size-200)] font-[number:var(--font-weight-regular)] leading-[var(--font-line-height-normal)]",
  "label-lg":
    "text-[length:var(--font-size-200)] font-[number:var(--font-weight-semibold)] leading-[var(--font-line-height-normal)]",
  "label-md":
    "text-[length:var(--font-size-100)] font-[number:var(--font-weight-regular)] leading-[var(--font-line-height-normal)]",
} as const;

export type TextVariant = keyof typeof variantClasses;

export const textVariants = Object.keys(variantClasses) as TextVariant[];

const defaultElement: Record<TextVariant, ElementType> = {
  "display-lg": "h1",
  "display-md": "h1",
  "display-sm": "h2",
  "heading-lg": "h2",
  "heading-md": "h3",
  "heading-sm": "h4",
  "body-lg": "p",
  "body-md": "p",
  "label-lg": "span",
  "label-md": "span",
};

export type TextProps<T extends ElementType = "p"> = {
  variant: TextVariant;
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Text<T extends ElementType = "p">({
  variant,
  as,
  className = "",
  ...props
}: TextProps<T>) {
  const Component = as ?? defaultElement[variant];
  return (
    <Component
      className={`font-pretendard tracking-[-0.02em] ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
