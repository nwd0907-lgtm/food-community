import type { Metadata } from "next";
import { cn } from "@/lib/cn";
import { AppBottomNavigation } from "../_components/AppBottomNavigation";
import { AppTopNavigation } from "../_components/AppTopNavigation";
import { gridContainer } from "../_components/layout";
import { MyPageContent } from "./MyPageContent";

export const metadata: Metadata = { title: "마이페이지" };

export default function MyPage() {
  return (
    <div className="flex flex-1 flex-col pb-14 lg:pb-0">
      <AppTopNavigation
        title="마이페이지"
        rightActions={[{ label: "프로필 설정", icon: "settings", href: "/my/profile" }]}
        className="sticky top-0 z-10"
      />
      <main
        className={cn(
          gridContainer,
          "flex flex-1 flex-col gap-[var(--spacing-24)] pt-[var(--spacing-24)] pb-[var(--spacing-32)]",
        )}
      >
        <MyPageContent />
      </main>
      <AppBottomNavigation current="my" />
    </div>
  );
}
