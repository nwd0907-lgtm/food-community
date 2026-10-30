import type { Metadata } from "next";
import Link from "next/link";
import { Text } from "@/components/typography/Text";
import { BrandHero } from "../_components/BrandHero";
import { GoogleLoginButton } from "./GoogleLoginButton";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <BrandHero>
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
    </BrandHero>
  );
}
