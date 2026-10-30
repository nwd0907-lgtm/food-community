"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNavigation, type BottomNavigationItem } from "@/components/navigation/BottomNavigation";
import { warmPlaces } from "@/lib/usePlace";
import { warmProfile } from "@/lib/useProfile";
import { AppInstallBanner } from "./AppInstallBanner";

// design.pen 메인 · 마이페이지 바텀 내비게이션: 홈 · 마이 2개만 노출
const items: (BottomNavigationItem & { href: string })[] = [
  { value: "home", label: "홈", icon: "home", href: "/" },
  { value: "my", label: "마이", icon: "user-round", href: "/my" },
];

/** 화면 하단 고정, 모바일·태블릿 전용. 데스크톱(lg)은 헤더의 마이 아이콘으로 대신한다. 설치 띠배너는 내비 바로 위에 쌓는다 */
export function AppBottomNavigation({ current }: { current: "home" | "my" }) {
  const router = useRouter();

  // 탭은 버튼이라 Link처럼 자동 prefetch되지 않는다. 화면 코드와 다른 탭의 데이터를 미리 받아 탭 전환을 즉시로 만든다
  // 데이터는 지금 화면의 요청과 겹치지 않게 잠시 뒤에 받는다
  useEffect(() => {
    items.forEach((item) => item.value !== current && router.prefetch(item.href));
    const timer = setTimeout(() => {
      if (current === "home") {
        warmProfile();
        warmPlaces({ mine: true });
      } else {
        warmPlaces();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [current, router]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 lg:hidden bg-[var(--color-background-surface)] shadow-[inset_0_1px_0_var(--color-border-default)]">
      <AppInstallBanner />
      <BottomNavigation
        items={items}
        value={current}
        onChange={(value) => router.push(items.find((item) => item.value === value)!.href)}
        className="mx-auto max-w-xl"
      />
    </div>
  );
}
