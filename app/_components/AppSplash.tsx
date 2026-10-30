"use client";

import { useEffect } from "react";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { BrandHero } from "./BrandHero";
import { HERO_READY, heroReadyScript } from "./heroReadyScript";

// 홈 화면 앱(standalone)으로 실행했을 때만 보이는 자체 스플래시: 로그인 화면에서 로그인 영역 대신 안내 문구
// 첫 페인트 전에 splashScript가 <html>에 app-splash 클래스를 붙여야 화면이 비치지 않으므로, 마크업은 모든 페이지에 숨겨 둔다
// 사진 · 워드마크가 둘 다 준비되기 전에는 흰 바탕만 두고, 준비되면 배경 · 빛 번짐 · 로고 · 문구를 한 번에 보인다
// 실행(세션)당 한 번, 그렇게 화면이 다 그려진 때부터 MIN_VISIBLE_MS 동안 보인 뒤 페이드아웃한다.
// (앱을 켠 시각부터 재면 첫 로딩이 길 때 남은 시간이 없어 스플래시가 한 번 번쩍이고 사라진다)
// 보이기 시작한 시각은 sessionStorage에 두어, 도중에 페이지가 새로 로드되면(세션 만료 → /login) 이어서 남은 시간만 보여 준다
// 로그인 쿠키가 없으면 첫 페인트 전에 /login으로 바로 이동하므로(loginRedirect) 스플래시는 로그인 페이지에서 시작한다
// iOS 시작 이미지(npm run pwa:splash)가 이 화면을 캡처한 것이라, OS 스플래시 → 자체 스플래시 → 로그인이 같은 그림으로 이어진다

const SPLASH_KEY = "foood:splash";
const DONE = "done";
const MIN_VISIBLE_MS = 2200;
const FADE_MS = 300;

/** <head>에서 바로 실행: 홈 화면 앱이고 이번 실행의 스플래시가 아직 안 끝났으면 켠다.
 *  켜면서 사진 · 워드마크를 받기 시작하고, 둘 다 준비되면(최대 HERO_MAX_WAIT_MS) hero-ready를 붙인다 (heroReadyScript).
 *  그 전에는 흰 바탕만 두고 배경 · 빛 번짐 · 로고 · 문구를 함께 숨겨, 한 번에 보이게 한다 */
export const splashScript = `try{var s=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;var v=sessionStorage.getItem("${SPLASH_KEY}");if(s&&v!=="${DONE}"&&(!v||Date.now()-Number(v)<${MIN_VISIBLE_MS})){document.documentElement.classList.add("app-splash");${heroReadyScript}}}catch(e){}`;

function readShownAt() {
  try {
    return Number(sessionStorage.getItem(SPLASH_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeSplashState(value: string) {
  try {
    sessionStorage.setItem(SPLASH_KEY, value);
  } catch {}
}

/** splashScript가 사진 · 워드마크 준비를 마쳐 화면이 다 그려질 때까지 */
function waitForReady(root: HTMLElement) {
  return new Promise<void>((resolve) => {
    if (root.classList.contains(HERO_READY)) return resolve();
    const observer = new MutationObserver(() => {
      if (!root.classList.contains(HERO_READY)) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(root, { attributeFilter: ["class"] });
  });
}

export function AppSplash() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("app-splash")) return;
    let cancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const start = async () => {
      let shownAt = readShownAt();
      if (!shownAt) {
        await waitForReady(root);
        if (cancelled) return;
        shownAt = Date.now();
        writeSplashState(String(shownAt));
      }
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
      fadeTimer = setTimeout(() => {
        root.classList.add("app-splash-leaving");
        removeTimer = setTimeout(() => {
          root.classList.remove("app-splash", "app-splash-leaving");
          writeSplashState(DONE);
        }, FADE_MS);
      }, wait);
    };
    void start();

    return () => {
      cancelled = true;
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <BrandHero
      variant="splash"
      className={cn(
        "fixed! inset-0 z-[100] hidden! touch-none overscroll-none transition-opacity duration-300 [html.app-splash_&]:flex! [html.app-splash-leaving_&]:opacity-0",
        // 사진 · 워드마크가 준비되기 전: 상태 표시줄과 같은 흰 바탕만 두고 배경 · 빛 번짐 · 로고 · 문구를 함께 숨긴다
        "[html:not(.hero-ready)_&]:bg-[var(--color-background-default)]! [html:not(.hero-ready)_&>*]:invisible",
      )}
    >
      <div aria-hidden className="flex h-12 items-center justify-center">
        <Text variant="body-lg" className="text-[var(--color-text-on-strong)]">
          여행지에서 숨겨진 맛집을 찾아보세요.
        </Text>
      </div>
    </BrandHero>
  );
}
