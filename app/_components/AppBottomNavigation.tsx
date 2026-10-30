"use client";

import { useRouter } from "next/navigation";
import { BottomNavigation, type BottomNavigationItem } from "@/components/navigation/BottomNavigation";

// design.pen 메인 · 마이페이지 바텀 내비게이션: 홈 · 마이 2개만 노출
const items: (BottomNavigationItem & { href: string })[] = [
  { value: "home", label: "홈", icon: "home", href: "/" },
  { value: "my", label: "마이", icon: "user-round", href: "/my" },
];

/** 화면 하단 고정, 모바일·태블릿 전용. 데스크톱(lg)은 헤더의 마이 아이콘으로 대신한다 */
export function AppBottomNavigation({ current }: { current: "home" | "my" }) {
  const router = useRouter();
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 lg:hidden bg-[var(--color-background-surface)] shadow-[inset_0_1px_0_var(--color-border-default)]">
      <BottomNavigation
        items={items}
        value={current}
        onChange={(value) => router.push(items.find((item) => item.value === value)!.href)}
        className="mx-auto max-w-xl"
      />
    </div>
  );
}
