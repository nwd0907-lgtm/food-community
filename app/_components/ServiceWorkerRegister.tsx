"use client";

import { useEffect } from "react";

/** public/sw.js 등록. 설치형 웹앱 조건을 채우기 위한 용도로, 개발 서버에서는 등록하지 않는다 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);
  return null;
}
