// 스토리 표시용 토큰 메타데이터(이름·참조 관계만). 실제 값은 app/tokens.css 하나에만 두고 런타임에 읽는다.

export const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const colorScales = [
  { scale: "brand", role: "BRAND", label: "화덕 오렌지" },
  { scale: "neutral", role: "NEUTRAL", label: "따뜻한 잉크" },
  { scale: "lime", role: "WARNING", label: "라임 옐로" },
  { scale: "green", role: "SUCCESS", label: "허브 그린" },
  { scale: "teal", role: "INFO", label: "딥 틸" },
  { scale: "red", role: "ERROR", label: "토마토 레드" },
] as const;

export const semanticColors = {
  text: [
    ["color-text-default", "color-neutral-900"],
    ["color-text-subtle", "color-neutral-600"],
    ["color-text-muted", "color-neutral-600"],
    ["color-text-disabled", "color-neutral-400"],
    ["color-text-brand", "color-brand-700"],
    ["color-text-on-brand", "color-neutral-50"],
    ["color-text-on-strong", "color-neutral-50"],
    ["color-text-on-strong-subtle", "color-neutral-300"],
    ["color-text-highlight", "color-lime-300"],
    ["color-text-warning", "color-lime-800"],
    ["color-text-success", "color-green-700"],
    ["color-text-info", "color-teal-700"],
    ["color-text-error", "color-red-700"],
  ],
  background: [
    ["color-background-default", "color-neutral-0"],
    ["color-background-subtle", "color-neutral-100"],
    ["color-background-strong", "color-neutral-900"],
    ["color-background-surface", "color-neutral-0"],
    ["color-background-inverse", "color-neutral-900"],
    ["color-background-disabled", "color-neutral-300"],
    ["color-background-brand", "color-brand-700"],
    ["color-background-brand-subtle", "color-brand-50"],
    ["color-background-brand-accent", "color-brand-500"],
    ["color-background-highlight", "color-lime-300"],
    ["color-background-warning", "color-lime-100"],
    ["color-background-success", "color-green-100"],
    ["color-background-info", "color-teal-100"],
    ["color-background-error", "color-red-50"],
    ["color-background-error-strong", "color-red-500"],
    ["color-background-map", "color-neutral-200"],
    ["color-background-map-land", "color-green-200"],
    ["color-background-skeleton", "color-gray-100"],
    ["color-background-skeleton-shine", "color-neutral-0"],
  ],
  border: [
    ["color-border-default", "color-neutral-200"],
    ["color-border-strong", "color-neutral-400"],
    ["color-border-brand", "color-brand-500"],
    ["color-border-warning", "color-lime-600"],
    ["color-border-success", "color-green-600"],
    ["color-border-info", "color-teal-600"],
    ["color-border-error", "color-red-600"],
  ],
} as const;

export const fontSizeTokens = [900, 800, 700, 600, 500, 400, 300, 200, 100].map((n) => `font-size-${n}`);
export const fontWeightTokens = ["font-weight-bold", "font-weight-semibold", "font-weight-regular"];
export const lineHeightTokens = ["font-line-height-tight", "font-line-height-normal"];

export const spacingTokens = [
  { name: "spacing-8", usage: "칩 나열" },
  { name: "spacing-12", usage: "리스트, 카드 갭" },
  { name: "spacing-16", usage: "화면 좌우 마진, 카드 갭" },
  { name: "spacing-20", usage: "" },
  { name: "spacing-24", usage: "섹션 구분" },
  { name: "spacing-32", usage: "큰 섹션 구분, 페이지 상하 여백" },
] as const;

/** :root에 정의된 CSS 변수의 계산값(var() 참조는 최종 값으로 풀림) */
export function readToken(name: string) {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x 대비율 */
export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
