import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { formContainer } from "../_components/layout";
import { GoogleLoginButton } from "./GoogleLoginButton";

export const metadata: Metadata = { title: "로그인" };

// design.pen 04 로그인 · Google: 전면 사진 + 상단 밝음/하단 블랙 그라디언트 · 빛 번짐 위 워드마크 · 하단 Google 버튼과 정책 링크
// 그라디언트의 흰색/검정은 background-default / background-strong 토큰에 투명도를 섞어 표현 (Tailwind 스캔을 위해 리터럴 클래스)
const overlay =
  "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-background-default)_100%,transparent)_0%,color-mix(in_srgb,var(--color-background-default)_85%,transparent)_12%,color-mix(in_srgb,var(--color-background-default)_50%,transparent)_25%,color-mix(in_srgb,var(--color-background-default)_14%,transparent)_38%,transparent_50%,transparent_66%,color-mix(in_srgb,var(--color-background-strong)_72%,transparent)_78%,color-mix(in_srgb,var(--color-background-strong)_95%,transparent)_84%,color-mix(in_srgb,var(--color-background-strong)_100%,transparent)_100%)]";
const glow =
  "bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-background-default)_100%,transparent)_0%,color-mix(in_srgb,var(--color-background-default)_100%,transparent)_28%,color-mix(in_srgb,var(--color-background-default)_90%,transparent)_50%,color-mix(in_srgb,var(--color-background-default)_56%,transparent)_72%,color-mix(in_srgb,var(--color-background-default)_24%,transparent)_88%,transparent_100%)]";

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col justify-between overflow-hidden bg-[var(--color-background-strong)]">
      <Image src="/images/walk.jpeg" alt="" fill priority sizes="100vw" className="-z-10 origin-[100%_75%] scale-[1.2] object-cover" />
      <div aria-hidden className={cn("absolute inset-0 -z-10", overlay)} />

      {/* 시안 기준(상태바 제외): 빛 번짐 top 51 · 높이 160, 워드마크 영역 top 105 · 높이 48 */}
      <div className="relative h-[251px]">
        <div
          aria-hidden
          className={cn(
            "absolute top-[51px] left-1/2 h-40 w-[540px] -translate-x-1/2 rounded-[50%]",
            glow,
          )}
        />
        <div className="absolute inset-x-0 top-[105px] flex h-12 items-center justify-center">
          <h1>
            <Image src="/brand/wordmark.png" alt="FOOOD" width={238} height={96} priority className="h-10 w-auto" />
          </h1>
        </div>
      </div>

      <div className={cn(formContainer, "flex flex-col gap-[var(--spacing-16)] pt-[var(--spacing-16)] pb-[var(--spacing-24)]")}>
        <GoogleLoginButton />
        <nav aria-label="정책" className="flex items-center justify-center gap-[var(--spacing-8)]">
          {/* 약관 · 개인정보 처리방침 화면은 시안에 없어 링크 자리만 둔다 */}
          <Link href="#" className="text-[var(--color-text-on-strong-subtle)] underline-offset-2 hover:underline">
            <Text variant="label-md">이용약관</Text>
          </Link>
          <Text variant="label-md" aria-hidden className="text-[var(--color-text-on-strong-subtle)] opacity-60">
            |
          </Text>
          <Link href="#" className="text-[var(--color-text-on-strong-subtle)] underline-offset-2 hover:underline">
            <Text variant="label-md">개인정보 처리방침</Text>
          </Link>
        </nav>
      </div>
    </main>
  );
}
