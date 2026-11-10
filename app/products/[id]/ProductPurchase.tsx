"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomSheet } from "@/components/bottom-sheet/BottomSheet";
import { Button } from "@/components/button/Button";
import { Toast } from "@/components/toast/Toast";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { SEATS_PER_PERSON } from "@/lib/payment";
import { formatPrice } from "@/lib/product";
import { requestPay } from "@/lib/requestPayment";
import { readingContainer } from "../../_components/layout";

// design.pen 12 상품 상세 하단 액션: 화면 아래 고정, 위 구분선, 여백 12 · 16 · 32, "수업 참여하기"(lg)
// design.pen 13 결제 바텀시트: "결제 정보" · 참여 현황(현재 / 정원) · 결제 인원(1명) · 결제 금액(브랜드 색) · 결제하기(lg)
// 정원이 차면 버튼을 끄고 "마감"으로 표시한다 (PRD ⑥ 제안, 시안 없음)
// 결제하기 → 서버 확인(prepare) → PortOne 결제창 → 결제 완료 페이지에서 서버 검증 (.claude/rules/payment.md)
export type ProductPurchaseProps = {
  productId: string;
  price: number;
  capacity: number;
  participants: number;
};

export function ProductPurchase({ productId, price, capacity, participants }: ProductPurchaseProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string>();
  const soldOut = participants >= capacity;

  const pay = async () => {
    setPaying(true);
    setError(undefined);
    const result = await requestPay(productId).catch(() => ({ ok: false as const, message: "결제를 시작하지 못했어요." }));
    if (result.ok) {
      router.push(result.completeUrl);
      return;
    }
    if ("status" in result && result.status === 401) {
      window.location.replace("/login");
      return;
    }
    setError(result.message);
    setPaying(false);
  };

  return (
    <>
      <div className="sticky bottom-0 z-10 bg-[var(--color-background-surface)] shadow-[inset_0_1px_0_var(--color-border-default)]">
        <div className={cn(readingContainer, "pt-[var(--spacing-12)] pb-[var(--spacing-32)]")}>
          <Button size="lg" fullWidth disabled={soldOut} onClick={() => setOpen(true)}>
            {soldOut ? "마감" : "수업 참여하기"}
          </Button>
        </div>
      </div>

      <BottomSheet
        open={open}
        onClose={() => {
          if (paying) return;
          setOpen(false);
          setError(undefined);
        }}
        title="결제 정보"
        contentClassName="mx-auto w-full max-w-xl px-5 pb-2"
      >
        <dl className="flex flex-col gap-3.5 py-5">
          <SummaryRow label="참여 현황" value={`${participants} / ${capacity}명`} />
          <SummaryRow label="결제 인원" value={`${SEATS_PER_PERSON}명`} />
          <SummaryRow label="결제 금액" value={formatPrice(price * SEATS_PER_PERSON)} emphasis />
        </dl>
        {error && <Toast type="error" message={error} className="mb-[var(--spacing-12)]" />}
        <Button size="lg" fullWidth loading={paying} onClick={pay}>
          결제하기
        </Button>
      </BottomSheet>
    </>
  );
}

function SummaryRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-[var(--spacing-12)]">
      <Text variant="body-md" as="dt" className="text-[var(--color-text-muted)]">
        {label}
      </Text>
      <Text variant={emphasis ? "heading-sm" : "body-md"} as="dd" className={emphasis ? "text-[var(--color-text-brand)]" : undefined}>
        {value}
      </Text>
    </div>
  );
}
