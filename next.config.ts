import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
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
