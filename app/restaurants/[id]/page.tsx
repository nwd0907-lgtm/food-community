import type { Metadata } from "next";
import { Suspense } from "react";
import { PlaceDetail, RestaurantDetailSkeleton } from "./PlaceDetail";

// 가게명 제목은 PlaceDetail이 <title>로 덮어쓴다 (BFF 조회가 클라이언트에서 일어남)
export const metadata: Metadata = { title: "맛집" };

// design.pen 02 상세 · 켄홈: 탑 내비(꺾쇠 뒤로 · 내 글이면 수정) · 사진 갤러리 · 본문
// params는 Suspense 안에서 읽어 정적 셸(스켈레톤)이 즉시 보이게 한다 (cacheComponents)
export default function RestaurantDetailPage({ params }: PageProps<"/restaurants/[id]">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<RestaurantDetailSkeleton />}>
        <RestaurantDetail params={params} />
      </Suspense>
    </div>
  );
}

async function RestaurantDetail({ params }: Pick<PageProps<"/restaurants/[id]">, "params">) {
  const { id } = await params;
  return <PlaceDetail id={id} />;
}
