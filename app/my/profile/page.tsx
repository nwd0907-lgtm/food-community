import type { Metadata } from "next";
import { AppTopNavigation } from "../../_components/AppTopNavigation";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "프로필 설정" };

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopNavigation
        title="프로필 설정"
        leftAction={{ label: "뒤로 가기", icon: "chevron-left", back: true, fallbackHref: "/my" }}
        className="sticky top-0 z-10"
      />
      <main className="flex flex-1 flex-col">
        <ProfileForm />
      </main>
    </div>
  );
}
