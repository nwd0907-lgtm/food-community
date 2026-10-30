"use client";

import { useSyncExternalStore } from "react";

// PWA 설치 유도 상태. 안드로이드(크롬 계열)는 beforeinstallprompt로 바로 설치, iOS는 설치 API가 없어 안내만 한다.
// 이미 홈 화면 앱으로 실행 중이거나 최근에 닫았으면 띠배너를 숨긴다.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallPlatform = "android" | "ios" | null;

const DISMISS_KEY = "foood:install-banner-dismissed-at";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

const listeners = new Set<() => void>();
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;

function emit() {
  listeners.forEach((listener) => listener());
}

// 이벤트가 하이드레이션 전에 발생할 수 있어 모듈 로드 시점에 바로 구독한다
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    emit();
  });
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const { userAgent, maxTouchPoints } = navigator;
  // iPadOS 13+는 데스크톱 Safari UA(Macintosh)를 쓰므로 터치 지원으로 구분
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}

function isDismissed() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    return Date.now() - dismissedAt < DISMISS_DURATION;
  } catch {
    return false;
  }
}

function getSnapshot(): InstallPlatform {
  if (installed || isStandalone() || isDismissed()) return null;
  if (deferredPrompt) return "android";
  if (isIos()) return "ios";
  return null;
}

function getServerSnapshot(): InstallPlatform {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 안드로이드 기본 설치 다이얼로그를 띄운다. 수락·거절과 관계없이 이벤트는 한 번만 쓸 수 있다 */
async function install() {
  if (!deferredPrompt) return;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  await prompt.prompt();
  await prompt.userChoice;
  emit();
}

/** 일정 기간(7일) 띠배너를 다시 띄우지 않는다 */
function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // 저장소를 쓸 수 없으면 현재 세션에서만 숨긴다
    installed = true;
  }
  emit();
}

export function useInstallPrompt() {
  const platform = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { platform, install, dismiss };
}
