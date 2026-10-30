// PWA 아이콘 · 파비콘 · iOS 스플래시 생성: npm run pwa:assets
// 원본: assets/brand/logo.png(F 심볼), assets/brand/logo-wordmark.png(Foood 워드마크)
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { brandBackground, splashImageUrl, splashScreens } from "../lib/pwa.ts";

const [BG_R, BG_G, BG_B] = [1, 3, 5].map((i) => parseInt(brandBackground.slice(i, i + 2), 16));
const BG = { r: BG_R, g: BG_G, b: BG_B }; // 로고 배경색
const MARK = { r: 135, g: 16, b: 26 }; // 로고 심볼색 #87101A

/** 베이지 배경을 걷어내고 심볼만 투명 PNG로 추출. 초록 채널 차이로 안티앨리어싱 알파를 복원한다 */
async function extractMark(file, box) {
  const { data, info } = await sharp(file).extract(box).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    const alpha = Math.min(1, Math.max(0, (BG.g - data[i + 1]) / (BG.g - MARK.g)));
    out[j] = MARK.r;
    out[j + 1] = MARK.g;
    out[j + 2] = MARK.b;
    out[j + 3] = Math.round(alpha * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** 배경 위 중앙에 심볼 배치. markRatio = 캔버스 높이 대비 심볼 높이 */
async function composeIcon(mark, size, markRatio, { radius = 0 } = {}) {
  const markImage = await sharp(mark).resize({ height: Math.round(size * markRatio) }).toBuffer();
  const background = radius
    ? Buffer.from(
        `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="rgb(${BG.r},${BG.g},${BG.b})"/></svg>`,
      )
    : { create: { width: size, height: size, channels: 4, background: { ...BG, alpha: 1 } } };
  return sharp(background).composite([{ input: markImage, gravity: "center" }]).png().toBuffer();
}

/** PNG 여러 장을 담은 ICO(Vista+ PNG 임베드 방식) */
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, buffer }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffer.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...pngs.map(({ buffer }) => buffer)]);
}

async function main() {
  await mkdir("public/icons", { recursive: true });
  await mkdir("public/splash", { recursive: true });

  const mark = await extractMark("assets/brand/logo.png", { left: 395, top: 205, width: 470, height: 826 });
  const wordmark = await extractMark("assets/brand/logo-wordmark.png", { left: 330, top: 207, width: 1112, height: 472 });

  // 매니페스트 아이콘: any는 심볼 70%, maskable은 안전 영역(지름 80%) 안에 들도록 52%
  await writeFile("public/icons/icon-192.png", await composeIcon(mark, 192, 0.7));
  await writeFile("public/icons/icon-512.png", await composeIcon(mark, 512, 0.7));
  await writeFile("public/icons/maskable-512.png", await composeIcon(mark, 512, 0.52));

  // iOS 홈 화면 아이콘(모서리는 iOS가 직접 깎는다)
  await writeFile("app/apple-icon.png", await composeIcon(mark, 180, 0.7));

  // 파비콘: 작은 크기에서 읽히도록 심볼을 크게, 둥근 사각 배경
  const favicons = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, buffer: await composeIcon(mark, size, 0.84, { radius: size * 0.2 }) })),
  );
  await writeFile("app/favicon.ico", toIco(favicons));
  await writeFile("app/icon.png", await composeIcon(mark, 96, 0.8, { radius: 20 }));

  // iOS 스플래시: 배경색 + 중앙 워드마크(화면 짧은 변의 56%)
  for (const screen of splashScreens) {
    const w = screen.width * screen.dpr;
    const h = screen.height * screen.dpr;
    const logo = await sharp(wordmark).resize({ width: Math.round(Math.min(w, h) * 0.56) }).toBuffer();
    await sharp({ create: { width: w, height: h, channels: 4, background: { ...BG, alpha: 1 } } })
      .composite([{ input: logo, gravity: "center" }])
      .png({ compressionLevel: 9, palette: true })
      .toFile(`public${splashImageUrl(screen)}`);
  }
}

await main();
