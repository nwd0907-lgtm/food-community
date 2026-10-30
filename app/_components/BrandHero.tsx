import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formContainer } from "./layout";

// design.pen 04 로그인 · Google: 전면 사진 + 상단 밝음/하단 블랙 그라디언트 · 빛 번짐 위 워드마크 · 하단 액션 영역
// 로그인 화면과 홈 화면 앱 실행 스플래시(AppSplash)가 같은 배경을 쓰고, 하단 영역만 다르다
// 그라디언트의 흰색/검정은 background-default / background-strong 토큰에 투명도를 섞어 표현 (Tailwind 스캔을 위해 리터럴 클래스)
const overlay =
  "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-background-default)_100%,transparent)_0%,color-mix(in_srgb,var(--color-background-default)_85%,transparent)_12%,color-mix(in_srgb,var(--color-background-default)_50%,transparent)_25%,color-mix(in_srgb,var(--color-background-default)_14%,transparent)_38%,transparent_50%,transparent_66%,color-mix(in_srgb,var(--color-background-strong)_72%,transparent)_78%,color-mix(in_srgb,var(--color-background-strong)_95%,transparent)_84%,color-mix(in_srgb,var(--color-background-strong)_100%,transparent)_100%)]";
const glow =
  "bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-background-default)_100%,transparent)_0%,color-mix(in_srgb,var(--color-background-default)_100%,transparent)_28%,color-mix(in_srgb,var(--color-background-default)_90%,transparent)_50%,color-mix(in_srgb,var(--color-background-default)_56%,transparent)_72%,color-mix(in_srgb,var(--color-background-default)_24%,transparent)_88%,transparent_100%)]";

const photoClasses = "-z-10 origin-[100%_75%] scale-[1.2] object-cover";

export type BrandHeroProps = {
  children: ReactNode;
  /** splash: 모든 페이지 HTML에 숨겨 두는 스플래시용. 숨김 상태에서 사진을 받지 않도록 CSS 배경으로 그리고 preload하지 않는다 */
  variant?: "page" | "splash";
  className?: string;
};

export function BrandHero({ children, variant = "page", className }: BrandHeroProps) {
  const Root = variant === "page" ? "main" : "div";
  const splash = variant === "splash";
  return (
    <Root
      className={cn(
        // 전체 화면 고정(h-dvh): 내용이 화면보다 길어 스크롤이 생기지 않게 화면 높이에 맞추고 넘치는 사진은 자른다
        "relative isolate flex h-dvh flex-1 flex-col justify-between overflow-hidden bg-[var(--color-background-strong)]",
        className,
      )}
    >
      {splash ? (
        <div aria-hidden className={cn("absolute inset-0 bg-[url(/images/walk.jpeg)] bg-cover bg-center", photoClasses)} />
      ) : (
        <Image src="/images/walk.jpeg" alt="" fill priority sizes="100vw" className={photoClasses} />
      )}
      <div aria-hidden className={cn("absolute inset-0 -z-10", overlay)} />

      {/* 시안 기준(상태바 제외): 빛 번짐 top 51 · 높이 160, 워드마크 영역 top 105 · 높이 48 (워드마크 자체는 높이 28) */}
      <div className="relative h-[251px]">
        <div
          aria-hidden
          className={cn(
            "absolute top-[51px] left-1/2 h-40 w-[540px] -translate-x-1/2 rounded-[50%]",
            glow,
          )}
        />
        <div className="absolute inset-x-0 top-[105px] flex h-12 items-center justify-center">
          {splash ? (
            // eslint-disable-next-line @next/next/no-img-element -- 숨김 상태에서도 받는 작은 로고라 최적화 경로를 거치지 않는다
            <img src="/brand/wordmark.png" alt="" width={238} height={96} className="h-7 w-auto" />
          ) : (
            <h1>
              <Image src="/brand/wordmark.png" alt="FOOOD" width={238} height={96} priority className="h-7 w-auto" />
            </h1>
          )}
        </div>
      </div>

      <div className={cn(formContainer, "flex flex-col gap-[var(--spacing-16)] pt-[var(--spacing-16)] pb-[var(--spacing-24)]")}>
        {children}
      </div>
    </Root>
  );
}
