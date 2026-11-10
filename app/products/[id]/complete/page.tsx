import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentComplete } from "./PaymentComplete";

export const metadata: Metadata = { title: "결제 완료" };

// design.pen 14 결제 완료: 탑 내비(← · 결제 완료) · 셰프 모자 72 · 완료 문구 · 위아래 8 띠로 나눈 결제 정보 · 하단 "결제 내역 보기"(lg)
// "결제 내역 보기" → 마이페이지 결제 내역 탭 (/my?tab=payments)
// TODO(결제 연동): 서버가 결제를 확인한 건만 보여 준다 (결제 id로 BFF 조회). 지금은 상품 정보(BFF GET /api/products/[id])로 그린다
export default function PaymentCompletePage({ params }: PageProps<"/products/[id]/complete">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense>
        <PaymentCompleteById params={params} />
      </Suspense>
    </div>
  );
}

async function PaymentCompleteById({ params }: Pick<PageProps<"/products/[id]/complete">, "params">) {
  const { id } = await params;
  return <PaymentComplete id={id} />;
}
