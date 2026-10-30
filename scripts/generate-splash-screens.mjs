// iOS 시작 이미지(apple-touch-startup-image) 생성: npm run pwa:splash [주소=http://localhost:3000]
// 앱 실행 스플래시(AppSplash) 화면을 기기별로 캡처해, OS 스플래시 → 자체 스플래시가 같은 그림으로 이어지게 한다.
// 홈 화면 앱은 상태 표시줄 아래부터 페이지를 그리므로, 캡처를 상태 표시줄 높이만큼 내려 흰 바탕(상태 표시줄 색)에 붙인다
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";
import { appThemeColor, splashImageUrl, splashScreens } from "../lib/pwa.ts";

const base = process.argv[2] ?? "http://localhost:3000";
const STATUS_BAR = { r: 255, g: 255, b: 255, alpha: 1 };
if (appThemeColor.toLowerCase() !== "#ffffff") throw new Error("상태 표시줄 색(appThemeColor)이 바뀌면 STATUS_BAR도 맞춘다");

await mkdir("public/splash", { recursive: true });
const browser = await chromium.launch();
try {
  for (const screen of splashScreens) {
    const viewport = { width: screen.width, height: screen.height - screen.statusBar };
    const page = await browser.newPage({ viewport, deviceScaleFactor: screen.dpr });
    // 스플래시는 홈 화면 앱(standalone)에서만 켜지므로 직접 켠다. 로그인 화면은 로그인 없이 열린다
    await page.goto(`${base}/login`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      document.documentElement.classList.add("app-splash");
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
    });
    await page.waitForTimeout(300);
    const shot = await page.screenshot();
    await page.close();

    const width = screen.width * screen.dpr;
    const height = screen.height * screen.dpr;
    await sharp({ create: { width, height, channels: 4, background: STATUS_BAR } })
      .composite([{ input: shot, top: screen.statusBar * screen.dpr, left: 0 }])
      .flatten({ background: STATUS_BAR })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(`public${splashImageUrl(screen)}`);
    console.log(splashImageUrl(screen));
  }
} finally {
  await browser.close();
}
