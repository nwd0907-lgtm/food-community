"use client";

import { useEffect } from "react";
import { HERO_READY, heroReadyScript } from "./heroReadyScript";

/** 첫 HTML 로드에서는 BrandHero의 인라인 스크립트가 hero-ready를 붙인다.
 *  로그아웃 뒤처럼 클라이언트 이동으로 들어오면 인라인 스크립트가 실행되지 않으므로 여기서 같은 일을 한다 */
export function HeroReady() {
  useEffect(() => prepareHero(), []);
  return null;
}

/** 로그인 화면 사진 · 워드마크를 받아 두고 hero-ready를 붙인다. 이미 준비됐으면 아무것도 하지 않는다.
 *  로그아웃처럼 곧 로그인 화면으로 갈 곳에서 미리 불러, 로그인 화면이 처음부터 다 그려진 채로 나오게 한다 */
export function prepareHero() {
  if (document.documentElement.classList.contains(HERO_READY)) return;
  // 인라인 스크립트와 같은 코드를 한 번 실행한다 (두 곳의 동작이 어긋나지 않게)
  new Function(heroReadyScript)();
}
