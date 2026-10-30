import type { Metadata, Viewport } from "next";
import { appThemeColor, splashImageUrl, splashScreens } from "@/lib/pwa";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="font-pretendard min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
