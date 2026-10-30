"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const hrefs = [leftAction, ...rightActions].flatMap((action) => (action && "href" in action ? [action.href] : []));
  const prefetchKey = hrefs.join(" ");

  // 버튼 액션(예: 프로필 설정 · 수정)은 Link가 아니라 자동 prefetch되지 않으므로 직접 받아 둔다
  useEffect(() => {
    if (prefetchKey) prefetchKey.split(" ").forEach((href) => router.prefetch(href));
  }, [prefetchKey, router]);

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
