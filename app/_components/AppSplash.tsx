"use client";

import { useEffect } from "react";
import { Text } from "@/components/typography/Text";
import { heroImageUrl, wordmarkUrl } from "@/lib/pwa";
import { BrandHero } from "./BrandHero";

// 홈 화면 앱(standalone)으로 실행했을 때만 보이는 자체 스플래시: 로그인 화면에서 로그인 영역 대신 안내 문구
// 첫 페인트 전에 splashScript가 <html>에 app-splash 클래스를 붙여야 화면이 비치지 않으므로, 마크업은 모든 페이지에 숨겨 둔다
// 실행(세션)당 한 번, 처음 뜬 시각부터 MIN_VISIBLE_MS 동안 보인 뒤 페이드아웃한다.
// 로그아웃 상태면 홈 → /login 으로 페이지가 새로 로드되는데(loginRedirect), 시작 시각을 sessionStorage에 두어 이어서 남은 시간만 보여 준다
// iOS 시작 이미지(npm run pwa:splash)가 이 화면을 캡처한 것이라, OS 스플래시 → 자체 스플래시 → 로그인이 같은 그림으로 이어진다

const SPLASH_KEY = "foood:splash";
const DONE = "done";
const MIN_VISIBLE_MS = 2200;
const FADE_MS = 300;

/** <head>에서 바로 실행: 홈 화면 앱이고 이번 실행의 스플래시가 아직 안 끝났으면 켠다. 처음이면 시작 시각을 남긴다.
 *  켤 때 사진 · 워드마크를 바로 받기 시작해, 스플래시가 사진 없이 먼저 그려지는 시간을 줄인다 */
export const splashScript = `try{var s=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;var k="${SPLASH_KEY}",v=sessionStorage.getItem(k);if(s&&v!=="${DONE}"){if(!v){v=String(Date.now());sessionStorage.setItem(k,v)}if(Date.now()-Number(v)<${MIN_VISIBLE_MS}){document.documentElement.classList.add("app-splash");["${heroImageUrl}","${wordmarkUrl}"].forEach(function(h){var l=document.createElement("link");l.rel="preload";l.as="image";l.href=h;document.head.appendChild(l)})}}}catch(e){}`;

function markDone() {
  try {
    sessionStorage.setItem(SPLASH_KEY, DONE);
  } catch {}
}

export function AppSplash() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("app-splash")) return;
    let startedAt = Date.now();
    try {
      startedAt = Number(sessionStorage.getItem(SPLASH_KEY)) || startedAt;
    } catch {}
    // 처음 뜬 시각부터 잰 남은 시간. 중간에 페이지가 바뀌면(로그인 이동) 새 페이지가 이어서 기다린다
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
    let removeTimer: ReturnType<typeof setTimeout>;
    const fadeTimer = setTimeout(() => {
      root.classList.add("app-splash-leaving");
      removeTimer = setTimeout(() => {
        root.classList.remove("app-splash", "app-splash-leaving");
        markDone();
      }, FADE_MS);
    }, wait);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <BrandHero
      variant="splash"
      className="fixed! inset-0 z-[100] hidden! touch-none overscroll-none transition-opacity duration-300 [html.app-splash_&]:flex! [html.app-splash-leaving_&]:opacity-0"
    >
      <div aria-hidden className="flex h-12 items-center justify-center">
        <Text variant="body-lg" className="text-[var(--color-text-on-strong)]">
          여행지에서 숨겨진 맛집을 찾아보세요.
        </Text>
      </div>
    </BrandHero>
  );
}
