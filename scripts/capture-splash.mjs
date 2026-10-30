// iOS 스플래시 생성: /splash-screen 화면을 기기 해상도별로 캡처해 public/splash/*.jpg 로 저장한다
// 앱 서버를 먼저 띄운 뒤 실행: npm run pwa:splash (기본 http://localhost:3000, SPLASH_BASE_URL로 변경)
import { mkdir, rm } from "node:fs/promises";
import { chromium } from "playwright";
import { splashImageUrl, splashScreens } from "../lib/pwa.ts";

const baseUrl = process.env.SPLASH_BASE_URL ?? "http://localhost:3000";

await rm("public/splash", { recursive: true, force: true });
await mkdir("public/splash", { recursive: true });

const browser = await chromium.launch();
for (const screen of splashScreens) {
  const page = await browser.newPage({
    viewport: { width: screen.width, height: screen.height },
    deviceScaleFactor: screen.dpr,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${baseUrl}/splash-screen`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // 개발 서버의 Next.js 표시기 등 화면 밖 요소가 찍히지 않도록 숨긴다
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.screenshot({ path: `public${splashImageUrl(screen)}`, type: "jpeg", quality: 85 });
  await page.close();
}
await browser.close();
