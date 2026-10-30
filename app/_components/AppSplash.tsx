"use client";

import { useEffect } from "react";
import { Text } from "@/components/typography/Text";
import { BrandHero } from "./BrandHero";

// 홈 화면 앱(standalone)으로 실행했을 때만 보이는 자체 스플래시: 로그인 화면에서 로그인 영역 대신 안내 문구
// 첫 페인트 전에 splashScript가 <html>에 app-splash 클래스를 붙여야 화면이 비치지 않으므로, 마크업은 모든 페이지에 숨겨 둔다
// 실행(세션)당 한 번만 띄우고, 최소 노출 시간이 지나면 페이드아웃한다

const SPLASH_KEY = "foood:splash-shown";
const MIN_VISIBLE_MS = 1200;
const FADE_MS = 300;

/** <head>에서 바로 실행: 홈 화면 앱 실행이고 이번 세션에 아직 안 띄웠으면 스플래시를 켠다 */
export const splashScript = `try{var s=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;if(s&&!sessionStorage.getItem("${SPLASH_KEY}"))document.documentElement.classList.add("app-splash")}catch(e){}`;

export function AppSplash() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("app-splash")) return;
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {}
    // 앱 시작(문서 요청) 시점부터 잰 시간이라, 로딩이 느렸으면 남은 시간만 기다린다
    const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
    let removeTimer: ReturnType<typeof setTimeout>;
    const fadeTimer = setTimeout(() => {
      root.classList.add("app-splash-leaving");
      removeTimer = setTimeout(() => root.classList.remove("app-splash", "app-splash-leaving"), FADE_MS);
    }, wait);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <BrandHero
      variant="splash"
      className="fixed! inset-0 z-[100] hidden! transition-opacity duration-300 [html.app-splash_&]:flex! [html.app-splash-leaving_&]:opacity-0"
    >
      <div aria-hidden className="flex h-12 items-center justify-center">
        <Text variant="body-lg" className="text-[var(--color-text-on-strong)]">
          여행지에서 숨겨진 맛집을 찾아보세요.
        </Text>
      </div>
    </BrandHero>
  );
}
