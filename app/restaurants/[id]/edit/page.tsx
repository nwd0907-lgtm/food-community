import type { Metadata } from "next";
import { Suspense } from "react";
import { AppTopNavigation } from "../../../_components/AppTopNavigation";
import { PlaceFormSkeleton } from "../../PlaceForm";
import { EditPlace } from "./EditPlace";

export const metadata: Metadata = { title: "맛집 수정" };

// 수정: 등록 화면(03) 재사용. 탑 내비(닫기) · 기존 값이 채워진 등록 폼
export default function EditPage({ params }: PageProps<"/restaurants/[id]/edit">) {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopNavigation
        title="맛집 수정"
        leftAction={{ label: "닫기", icon: "close", back: true, fallbackHref: "/" }}
        className="sticky top-0 z-10"
      />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<PlaceFormSkeleton />}>
          <EditContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function EditContent({ params }: Pick<PageProps<"/restaurants/[id]/edit">, "params">) {
  const { id } = await params;
  return <EditPlace id={id} />;
}
