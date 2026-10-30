import { heroImageUrl, wordmarkUrl } from "@/lib/pwa";

// 로그인 · 스플래시(BrandHero)의 배경 사진 · 빛 번짐 · 워드마크는 <html>에 hero-ready가 붙기 전까지 숨긴다.
// 사진과 워드마크를 따로 받으면 셋이 제각각 나타나 깜빡이므로, 둘 다 받아 디코드한 뒤(최대 HERO_MAX_WAIT_MS) 한 번에 보인다

export const HERO_READY = "hero-ready";
export const HERO_MAX_WAIT_MS = 3000;

/** 인라인 <script>용: 사진 · 워드마크를 받아 둘 다 준비되면 hero-ready를 붙인다 */
export const heroReadyScript = `(function(){var r=document.documentElement;if(r.classList.contains("${HERO_READY}"))return;var n=0,ready=function(){r.classList.add("${HERO_READY}")};setTimeout(ready,${HERO_MAX_WAIT_MS});["${heroImageUrl}","${wordmarkUrl}"].forEach(function(h){var i=new Image(),d=function(){if(++n===2)ready()};i.onload=function(){i.decode?i.decode().then(d,d):d()};i.onerror=d;i.src=h})})()`;

/** 숨겨 둘 레이어(사진 · 빛 번짐 · 워드마크)에 붙이는 클래스 */
export const heroLayer = "invisible [html.hero-ready_&]:visible";
