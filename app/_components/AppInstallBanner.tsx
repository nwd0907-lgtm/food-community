"use client";

import { useEffect, useState } from "react";
import { InstallBanner } from "@/components/install-prompt/InstallBanner";
import { IosInstallGuide } from "@/components/install-prompt/IosInstallGuide";
import { useInstallPrompt } from "@/lib/useInstallPrompt";

/** 바텀 내비 바로 위 설치 띠배너. 안드로이드는 탭하면 바로 설치, iOS는 바텀시트로 홈 화면 추가 방법을 안내한다 */
export function AppInstallBanner() {
  const { platform, install, dismiss } = useInstallPrompt();
  const [guideOpen, setGuideOpen] = useState(false);

  // 띠배너가 보이는 동안 페이지 하단 여백 · FAB 위치가 배너 높이(64)만큼 올라가도록 알린다
  useEffect(() => {
    if (!platform) return;
    const root = document.documentElement;
    root.style.setProperty("--app-install-banner-height", "64px");
    return () => {
      root.style.removeProperty("--app-install-banner-height");
    };
  }, [platform]);

  return (
    <>
      {platform && (
        <InstallBanner
          onInstall={platform === "android" ? install : () => setGuideOpen(true)}
          onClose={dismiss}
        />
      )}
      <IosInstallGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
