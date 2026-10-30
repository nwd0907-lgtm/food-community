import type { Metadata } from "next";
import { AppTopNavigation } from "../../_components/AppTopNavigation";
import { PlaceForm } from "../PlaceForm";

export const metadata: Metadata = { title: "맛집 등록" };

// design.pen 03 등록: 탑 내비(닫기) · 등록 폼
export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopNavigation
        title="맛집 등록"
        leftAction={{ label: "닫기", icon: "close", back: true, fallbackHref: "/" }}
        className="sticky top-0 z-10"
      />
      <main className="flex flex-1 flex-col">
        <PlaceForm />
      </main>
    </div>
  );
}
