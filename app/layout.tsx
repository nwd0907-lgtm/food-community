import type { Metadata, Viewport } from "next";
import { appThemeColor, splashImageUrl, splashScreens } from "@/lib/pwa";
import { AppSplash, splashScript } from "./_components/AppSplash";
import { loginRedirectScript } from "./_components/loginRedirect";
import { ServiceWorkerRegister } from "./_components/ServiceWorkerRegister";
import { pretendard } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FOOOD", template: "%s · FOOOD" },
  description: "이웃이 직접 발견한 동네 맛집",
  applicationName: "FOOOD",
  // iOS 홈 화면 실행: 스플래시는 기기 해상도별 apple-touch-startup-image로 지정
  appleWebApp: {
    capable: true,
    title: "FOOOD",
    statusBarStyle: "default",
    startupImage: splashScreens.map((screen) => ({
      url: splashImageUrl(screen),
      media: `(device-width: ${screen.width}px) and (device-height: ${screen.height}px) and (-webkit-device-pixel-ratio: ${screen.dpr}) and (orientation: portrait)`,
    })),
  },
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: appThemeColor,
  // 입력 글자가 14px(16px 미만)라 iOS가 입력창을 누를 때 화면을 자동 확대한다. 이를 막는다
  // (iOS는 이 값과 상관없이 손가락 확대를 허용한다. 안드로이드는 손가락 확대도 막힌다)
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // splashScript가 하이드레이션 전에 <html> 클래스를 바꾸므로 그 불일치 경고만 끈다
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: loginRedirectScript }} />
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
      </head>
      <body className="font-pretendard min-h-full flex flex-col">
        <AppSplash />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
