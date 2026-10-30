import { cn } from "@/lib/cn";

// TextField · Textarea · Select 입력 박스 공통 스타일 (design.pen Input Box / Textarea Box / Select Box)
// 테두리는 디자인의 inside stroke와 같게 inset shadow로 그려 상태가 바뀌어도 레이아웃이 밀리지 않게 한다.

export type FieldSize = "sm" | "md" | "lg";

export type FieldState = "default" | "focused" | "disabled" | "error";

/** brand: 평소에도 브랜드색 1px 테두리(메인 검색처럼 눈에 띄어야 하는 필드). 비활성 · 오류는 기본과 같다 */
export type FieldTone = "default" | "brand";

export const fieldSizeClasses: Record<FieldSize, string> = {
  sm: "h-8 rounded-lg",
  md: "h-10 rounded-[10px]",
  lg: "h-12 rounded-xl",
};

/** 높이만 (라운드를 따로 지정할 때. 예: TextField shape="pill") */
export const fieldHeightClasses: Record<FieldSize, string> = { sm: "h-8", md: "h-10", lg: "h-12" };

export const fieldIconSize = { sm: 16, md: 20, lg: 20 } as const;

// 포커스 테두리: 1px, 브랜드 버튼(primary) 배경과 같은 background-brand 색
const stateClasses: Record<FieldState, string> = {
  default: "bg-[var(--color-background-surface)] shadow-[inset_0_0_0_1px_var(--color-border-default)]",
  focused: "bg-[var(--color-background-surface)] shadow-[inset_0_0_0_1px_var(--color-background-brand)]",
  disabled: "bg-[var(--color-background-disabled)] shadow-[inset_0_0_0_1px_var(--color-border-default)]",
  error: "bg-[var(--color-background-surface)] shadow-[inset_0_0_0_1.5px_var(--color-border-error)]",
};

/** 실제 포커스(focus-within)에도 focused 스타일이 나오도록 default/error 상태에 추가 */
const focusWithin = "focus-within:shadow-[inset_0_0_0_1px_var(--color-background-brand)]";

const brandBox = "bg-[var(--color-background-surface)] shadow-[inset_0_0_0_1px_var(--color-background-brand)]";

export function fieldBoxClasses(state: FieldState, tone: FieldTone = "default") {
  if (tone === "brand" && (state === "default" || state === "focused")) return brandBox;
  return cn(stateClasses[state], (state === "default" || state === "error") && focusWithin);
}

export function resolveFieldState({
  disabled,
  error,
  focused,
}: {
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
}): FieldState {
  if (disabled) return "disabled";
  if (error) return "error";
  if (focused) return "focused";
  return "default";
}

export function helperColor(state: FieldState) {
  if (state === "error") return "text-[var(--color-text-error)]";
  if (state === "disabled") return "text-[var(--color-text-disabled)]";
  return "text-[var(--color-text-muted)]";
}
