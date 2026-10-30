"use client";

import { useEffect } from "react";
import { HERO_READY, heroReadyScript } from "./heroReadyScript";

/** 첫 HTML 로드에서는 BrandHero의 인라인 스크립트가 hero-ready를 붙인다.
 *  로그아웃 뒤처럼 클라이언트 이동으로 들어오면 인라인 스크립트가 실행되지 않으므로 여기서 같은 일을 한다 */
export function HeroReady() {
  useEffect(() => {
    if (document.documentElement.classList.contains(HERO_READY)) return;
    // 인라인 스크립트와 같은 코드를 한 번 실행한다 (두 곳의 동작이 어긋나지 않게)
    new Function(heroReadyScript)();
  }, []);
  return null;
}
