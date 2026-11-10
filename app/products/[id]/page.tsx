import type { Metadata } from "next";
import { Suspense } from "react";
import { PRODUCT_KIND } from "@/lib/product";
import { ProductDetail, ProductDetailSkeleton } from "./ProductDetail";

// 상품명 제목은 ProductDetail이 <title>로 덮어쓴다 (BFF 조회가 클라이언트에서 일어남)
export const metadata: Metadata = { title: PRODUCT_KIND };

// design.pen 12 상품 상세 · 강연: 탑 내비(← · 강연·모임) · 사진 갤러리(상품명 겹침) · 한 줄 문구 · 소개 · 수업 정보 · 하단 고정 "수업 참여하기"
// params는 Suspense 안에서 읽어 정적 셸(스켈레톤)이 즉시 보이게 한다 (cacheComponents)
export default function ProductDetailPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailById params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetailById({ params }: Pick<PageProps<"/products/[id]">, "params">) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
