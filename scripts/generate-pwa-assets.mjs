// PWA 아이콘 · 파비콘 · 헤더 워드마크 · 로그인/스플래시 배경 사진 생성: npm run pwa:assets
// 원본: assets/brand/logo.png(F 심볼), assets/brand/logo-wordmark.png(Foood 워드마크), public/images/walk.jpeg(배경 사진)
// iOS 시작 이미지는 화면을 캡처해 만든다: npm run pwa:splash (scripts/generate-splash-screens.mjs)
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { heroImageUrl, iconBackground, wordmarkUrl } from "../lib/pwa.ts";

const hexToRgb = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return { r, g, b };
};
const SOURCE_BG = { r: 232, g: 222, b: 208 }; // 원본 로고 파일의 베이지 배경(#E8DED0). 심볼 추출에만 쓴다
const BG = hexToRgb(iconBackground);
const MARK = { r: 135, g: 16, b: 26 }; // 로고 심볼색 #87101A

/** 베이지 배경을 걷어내고 심볼만 투명 PNG로 추출. 초록 채널 차이로 안티앨리어싱 알파를 복원한다 */
async function extractMark(file, box) {
  const { data, info } = await sharp(file).extract(box).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    const alpha = Math.min(1, Math.max(0, (SOURCE_BG.g - data[i + 1]) / (SOURCE_BG.g - MARK.g)));
    out[j] = MARK.r;
    out[j + 1] = MARK.g;
    out[j + 2] = MARK.b;
    out[j + 3] = Math.round(alpha * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** 배경 위 중앙에 심볼 배치. markRatio = 캔버스 높이 대비 심볼 높이, transparent면 배경 없이 심볼만 */
async function composeIcon(mark, size, markRatio, { transparent = false } = {}) {
  const markImage = await sharp(mark).resize({ height: Math.round(size * markRatio) }).toBuffer();
  const background = { ...BG, alpha: transparent ? 0 : 1 };
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: markImage, gravity: "center" }])
    .png()
    .toBuffer();
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
  await mkdir("public/brand", { recursive: true });

  const mark = await extractMark("assets/brand/logo.png", { left: 395, top: 205, width: 470, height: 826 });
  const wordmark = await extractMark("assets/brand/logo-wordmark.png", { left: 330, top: 207, width: 1112, height: 472 });

  // 헤더 워드마크: 배경 없는 투명 PNG, 여백을 걷어내고 높이 96(표시 높이 32의 3배)
  await sharp(wordmark).trim().resize({ height: 96 }).png().toFile(`public${wordmarkUrl}`);

  // 매니페스트 아이콘: any는 투명 배경 · 심볼 80%, maskable은 마스크로 잘리므로 흰 배경 · 안전 영역(지름 80%) 안에 들도록 52%
  await writeFile("public/icons/icon-192.png", await composeIcon(mark, 192, 0.8, { transparent: true }));
  await writeFile("public/icons/icon-512.png", await composeIcon(mark, 512, 0.8, { transparent: true }));
  await writeFile("public/icons/maskable-512.png", await composeIcon(mark, 512, 0.52));

  // iOS 홈 화면 아이콘: 투명 부분을 iOS가 검게 채우므로 흰 배경(모서리는 iOS가 직접 깎는다)
  await writeFile("app/apple-icon.png", await composeIcon(mark, 180, 0.7));

  // 파비콘: 배경 없이 심볼만, 작은 크기에서 읽히도록 캔버스 높이를 거의 채운다
  const favicons = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, buffer: await composeIcon(mark, size, 0.96, { transparent: true }) })),
  );
  await writeFile("app/favicon.ico", toIco(favicons));
  await writeFile("app/icon.png", await composeIcon(mark, 96, 0.96, { transparent: true }));

  // 로그인 · 스플래시 배경 사진: 스플래시가 첫 화면에 바로 그려지도록 가볍게(원본 400KB → WebP)
  await sharp("public/images/walk.jpeg").webp({ quality: 70 }).toFile(`public${heroImageUrl}`);
}

await main();
