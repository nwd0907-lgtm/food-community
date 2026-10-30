// 설치 조건 충족용 최소 서비스 워커. 오프라인 캐시 · 푸시 알림은 범위 밖이라 요청은 그대로 네트워크로 보낸다.
// 일부 크로미움 계열 브라우저(구버전 크롬, 삼성 인터넷)는 fetch 핸들러가 있어야 설치 프롬프트를 띄운다.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
