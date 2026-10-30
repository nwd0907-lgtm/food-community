"use client";

import { useRouter } from "next/navigation";
import type { IconName } from "@/components/icon/Icon";
import { TopNavigation } from "@/components/navigation/TopNavigation";

// TopNavigation 액션을 라우팅에 연결. back은 히스토리가 없으면(직접 진입) fallbackHref로 이동
type Action = { label: string; icon: IconName } & ({ href: string } | { back: true; fallbackHref: string });

export type AppTopNavigationProps = {
  title: string;
  leftAction?: Action;
  rightActions?: Action[];
  className?: string;
};

export function AppTopNavigation({ title, leftAction, rightActions = [], className }: AppTopNavigationProps) {
  const router = useRouter();

  const toNavAction = (action: Action) => ({
    label: action.label,
    icon: action.icon,
    onClick: () => {
      if ("href" in action) router.push(action.href);
      else if (window.history.length > 1) router.back();
      else router.push(action.fallbackHref);
    },
  });

  return (
    <TopNavigation
      title={title}
      leftAction={leftAction && toNavAction(leftAction)}
      rightActions={rightActions.map(toNavAction)}
      className={className}
      // 데스크톱: 좌우 아이콘을 화면 끝이 아닌 서비스 영역(1280, 좌우 32) 끝에 맞춘다. 메인 헤더와 같은 기준
      contentClassName="lg:mx-auto lg:max-w-[1280px] lg:px-[var(--spacing-32)]"
    />
  );
}
