import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 맛집 · 프로필 사진은 업로드마다 새 경로(uuid)라 내용이 바뀌지 않는다. 최적화 결과를 31일 동안 다시 만들지 않는다
    minimumCacheTTL: 2678400,
    // 프로필·맛집 사진: Supabase Storage 공개 URL(SUPABASE_STORAGE_URL), 기본값인 Google 계정 사진
    remotePatterns: [
      ...(process.env.SUPABASE_STORAGE_URL ? [new URL(`${process.env.SUPABASE_STORAGE_URL.replace(/\/$/, "")}/**`)] : []),
      new URL("https://lh3.googleusercontent.com/**"),
    ],
  },
  // 서비스 워커는 항상 최신본을 받도록 캐시하지 않는다
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      // 로그인 · 스플래시 사진과 워드마크: 앱을 켤 때마다 서버에 다시 묻지 않고 기기 캐시로 바로 그린다 (lib/pwa)
      // 7일 지나면 다시 확인한다. 바로 바꿔야 하면 파일 이름을 바꾼다
      {
        source: "/brand/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
