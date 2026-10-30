import type { MetadataRoute } from "next";
import { appThemeColor, splashBackground } from "@/lib/pwa";

// 설치형 웹앱 매니페스트. 안드로이드 스플래시는 name · background_color · 512 아이콘으로 자동 생성된다
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "FOOOD · 동네 맛집 커뮤니티",
    short_name: "FOOOD",
    description: "이웃이 직접 발견한 동네 맛집",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: splashBackground,
    theme_color: appThemeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
