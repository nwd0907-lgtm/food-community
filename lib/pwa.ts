// PWA 공용 값. scripts/generate-pwa-assets.mjs(이미지 생성)와 앱 메타데이터가 함께 쓴다.

/** 불투명해야 하는 앱 아이콘(iOS apple-icon, 안드로이드 maskable)의 배경. 나머지 로고는 투명 배경 */
export const iconBackground = "#FFFFFF";

/** 스플래시 배경: 매니페스트 background_color(안드로이드 스플래시) */
export const splashBackground = "#FFFFFF";

/** 로그인 · 스플래시 배경 사진과 워드마크. 둘이 같은 파일을 써서 스플래시가 걷힐 때 다시 받지 않는다 (npm run pwa:assets로 생성) */
export const heroImageUrl = "/brand/hero.webp";
export const wordmarkUrl = "/brand/wordmark.png";

/** 브라우저 UI · 상태 표시줄 색: 앱 배경(--color-background-default, neutral-0)과 맞춘다 */
export const appThemeColor = "#ffffff";

/** iOS apple-touch-startup-image 대상 기기: CSS 뷰포트(세로) × DPR · 상태 표시줄 높이(statusBar).
 *  홈 화면 앱은 상태 표시줄 아래부터 페이지를 그리므로, 시작 이미지도 그만큼 내려 그려야 자체 스플래시와 겹친다 */
export const splashScreens = [
  { width: 440, height: 956, dpr: 3, statusBar: 62 }, // iPhone 16 Pro Max, 17 Pro Max
  { width: 430, height: 932, dpr: 3, statusBar: 59 }, // iPhone 14 Pro Max, 15 Plus · Pro Max, 16 Plus
  { width: 420, height: 912, dpr: 3, statusBar: 68 }, // iPhone Air
  { width: 402, height: 874, dpr: 3, statusBar: 62 }, // iPhone 16 Pro, 17, 17 Pro
  { width: 393, height: 852, dpr: 3, statusBar: 59 }, // iPhone 14 Pro, 15, 15 Pro, 16
  { width: 428, height: 926, dpr: 3, statusBar: 47 }, // iPhone 12 · 13 Pro Max, 14 Plus
  { width: 390, height: 844, dpr: 3, statusBar: 47 }, // iPhone 12, 13, 14, 16e
  { width: 375, height: 812, dpr: 3, statusBar: 50 }, // iPhone X, XS, 11 Pro, 12 · 13 mini
  { width: 414, height: 896, dpr: 3, statusBar: 44 }, // iPhone XS Max, 11 Pro Max
  { width: 414, height: 896, dpr: 2, statusBar: 48 }, // iPhone XR, 11
  { width: 414, height: 736, dpr: 3, statusBar: 20 }, // iPhone 6+ ~ 8 Plus
  { width: 375, height: 667, dpr: 2, statusBar: 20 }, // iPhone 6 ~ 8, SE 2 · 3
  { width: 320, height: 568, dpr: 2, statusBar: 20 }, // iPhone SE 1
  { width: 1024, height: 1366, dpr: 2, statusBar: 24 }, // iPad Pro 12.9"
  { width: 834, height: 1194, dpr: 2, statusBar: 24 }, // iPad Pro 11"
  { width: 820, height: 1180, dpr: 2, statusBar: 24 }, // iPad Air 10.9"
  { width: 768, height: 1024, dpr: 2, statusBar: 20 }, // iPad mini ~ 9.7"
  { width: 744, height: 1133, dpr: 2, statusBar: 24 }, // iPad mini 6
] as const;

export function splashImageUrl({ width, height, dpr }: (typeof splashScreens)[number]) {
  return `/splash/splash-${width * dpr}x${height * dpr}.jpg`;
}
