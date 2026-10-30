// PWA 공용 값. scripts/generate-pwa-assets.mjs(이미지 생성)와 앱 메타데이터가 함께 쓴다.

/** 로고 배경색: 앱 아이콘 · 파비콘 배경 */
export const brandBackground = "#E8DED0";

/** 안드로이드 스플래시 배경: 매니페스트 background_color. 안드로이드는 이 색 위에 앱 아이콘만 그린다 */
export const splashBackground = "#FFFFFF";

/** 브라우저 UI · 상태 표시줄 색: 앱 배경(--color-background-default, neutral-50)과 맞춘다 */
export const appThemeColor = "#fbfaf7";

/** iOS apple-touch-startup-image 대상 기기: CSS 뷰포트(세로) × DPR. 이미지는 npm run pwa:splash 로 만든다 */
export const splashScreens = [
  { width: 440, height: 956, dpr: 3 }, // iPhone 16 Pro Max, 17 Pro Max
  { width: 430, height: 932, dpr: 3 }, // iPhone 14 Pro Max, 15 Plus · Pro Max, 16 Plus
  { width: 420, height: 912, dpr: 3 }, // iPhone Air
  { width: 402, height: 874, dpr: 3 }, // iPhone 16 Pro, 17, 17 Pro
  { width: 393, height: 852, dpr: 3 }, // iPhone 14 Pro, 15, 15 Pro, 16
  { width: 428, height: 926, dpr: 3 }, // iPhone 12 · 13 Pro Max, 14 Plus
  { width: 390, height: 844, dpr: 3 }, // iPhone 12, 13, 14, 16e
  { width: 375, height: 812, dpr: 3 }, // iPhone X, XS, 11 Pro, 12 · 13 mini
  { width: 414, height: 896, dpr: 3 }, // iPhone XS Max, 11 Pro Max
  { width: 414, height: 896, dpr: 2 }, // iPhone XR, 11
  { width: 414, height: 736, dpr: 3 }, // iPhone 6+ ~ 8 Plus
  { width: 375, height: 667, dpr: 2 }, // iPhone 6 ~ 8, SE 2 · 3
  { width: 320, height: 568, dpr: 2 }, // iPhone SE 1
  { width: 1024, height: 1366, dpr: 2 }, // iPad Pro 12.9"
  { width: 834, height: 1194, dpr: 2 }, // iPad Pro 11"
  { width: 820, height: 1180, dpr: 2 }, // iPad Air 10.9"
  { width: 768, height: 1024, dpr: 2 }, // iPad mini ~ 9.7"
  { width: 744, height: 1133, dpr: 2 }, // iPad mini 6
] as const;

export function splashImageUrl({ width, height, dpr }: (typeof splashScreens)[number]) {
  return `/splash/splash-${width * dpr}x${height * dpr}.jpg`;
}
