import type { Metadata } from "next";
import { Text } from "@/components/typography/Text";
import { BrandHero } from "../_components/BrandHero";

// iOS 스플래시 원본 화면: 로그인 화면에서 로그인 영역만 빼고, 그 자리에 안내 문구를 둔다
// npm run pwa:splash 가 이 화면을 기기 해상도별로 캡처해 public/splash/*.png 를 만든다
export const metadata: Metadata = { title: "FOOOD", robots: { index: false } };

export default function SplashScreenPage() {
  return (
    <BrandHero>
      <div className="flex h-12 items-center justify-center">
        <Text variant="body-lg" className="text-[var(--color-text-on-strong)]">
          여행지에서 숨겨진 맛집을 찾아보세요.
        </Text>
      </div>
    </BrandHero>
  );
}
