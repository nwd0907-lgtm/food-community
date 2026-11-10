"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Empty } from "@/components/empty/Empty";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { Text } from "@/components/typography/Text";
import { invalidateBff, writeBff } from "@/lib/bff";
import { cn } from "@/lib/cn";
import type { PaymentCompleteResponse, PaymentError } from "@/lib/payment";
import { formatPrice, formatSchedule, type Product } from "@/lib/product";
import { invalidatePayments } from "@/lib/usePayments";
import { AppTopNavigation } from "../../../_components/AppTopNavigation";
import { formContainer } from "../../../_components/layout";
import { ProductInfoList } from "../../_components/ProductInfoList";
import { ViewPaymentsButton } from "./ViewPaymentsButton";

// design.pen 14 결제 완료 본문. 결제창이 끝난 뒤 PC(반환값) · 모바일(redirectUrl) 모두 여기로 온다 (?paymentId · 실패 시 &code&message)
// 서버(BFF POST /api/payments/complete)가 포트원 조회로 검증 · 기록한 결제만 완료로 보여 준다 (.claude/rules/payment.md)
type State =
  | { status: "verifying" }
  | { status: "paid"; payment: PaymentCompleteResponse }
  | { status: "failed"; message: string };

/** 같은 결제를 두 번 검증하지 않게 진행 중인 요청을 합친다 (StrictMode 이중 실행 · 재렌더). 서버도 멱등이다 */
const inflight = new Map<string, Promise<State>>();

function verify(paymentId: string) {
  let request = inflight.get(paymentId);
  if (!request) {
    request = fetch("/api/payments/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    })
      .then(async (response): Promise<State> => {
        if (response.status === 401) {
          window.location.replace("/login");
          return { status: "verifying" };
        }
        if (response.ok) return { status: "paid", payment: (await response.json()) as PaymentCompleteResponse };
        const error = (await response.json().catch(() => null)) as PaymentError | null;
        return { status: "failed", message: error?.message ?? "결제를 확인하지 못했어요." };
      })
      .catch((): State => ({ status: "failed", message: "네트워크 연결을 확인해 주세요." }))
      .finally(() => inflight.delete(paymentId));
    inflight.set(paymentId, request);
  }
  return request;
}

export function PaymentComplete({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const code = searchParams.get("code");
  const failure = code ? (searchParams.get("message") ?? "결제가 완료되지 않았어요.") : !paymentId ? "결제 정보가 없어요." : null;
  const [state, setState] = useState<State>({ status: "verifying" });

  useEffect(() => {
    if (failure || !paymentId) return;
    let active = true;
    void verify(paymentId).then((next) => {
      if (!active) return;
      setState(next);
      if (next.status === "paid") syncProductCache(next.payment.product);
    });
    return () => {
      active = false;
    };
  }, [paymentId, failure]);

  const productHref = `/products/${encodeURIComponent(id)}`;
  const view: State = failure ? { status: "failed", message: failure } : state;

  return (
    <>
      <AppTopNavigation
        title={view.status === "failed" ? "결제 실패" : "결제 완료"}
        leftAction={{ label: "뒤로 가기", icon: "arrow-left", back: true, fallbackHref: productHref }}
        className="sticky top-0 z-10"
      />
      {view.status === "failed" ? (
        <main className={cn(formContainer, "flex flex-1 flex-col items-center justify-center pb-[var(--spacing-32)]")}>
          <Empty
            visual="circle-alert"
            title="결제가 완료되지 않았어요"
            description={view.message}
            primaryAction={{ label: "상품으로 돌아가기", onClick: () => router.replace(productHref) }}
          />
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center gap-[var(--spacing-24)] pt-[52px] pb-[var(--spacing-32)]">
          <Image
            src="/images/payment-complete-chef-hat.png"
            alt=""
            width={72}
            height={72}
            preload
            className="size-18 object-contain"
          />
          <div
            className={cn(formContainer, "flex flex-col items-center gap-[var(--spacing-8)] text-center")}
            aria-live="polite"
          >
            <Text variant="heading-md" as="h2">
              {view.status === "paid" ? "결제가 완료되었습니다." : "결제를 확인하고 있어요."}
            </Text>
            <Text variant="body-md" className="text-[var(--color-text-muted)]">
              {view.status === "paid" ? "설레는 마음과 함께 수업에서 만나요." : "잠시만 기다려 주세요."}
            </Text>
          </div>
          {/* 결제 정보: 위 8 띠 → 20 → 정보 → 20 → 아래 8 띠. 띠는 화면 끝까지 */}
          <section aria-label="결제 정보" className="flex w-full flex-col gap-[var(--spacing-20)] pt-[var(--spacing-8)]">
            <div aria-hidden className="h-2 bg-[var(--color-background-subtle)]" />
            {view.status === "paid" ? (
              <ProductInfoList
                className={formContainer}
                items={[
                  { label: "상품명", value: view.payment.product.name },
                  { label: "일시", value: formatSchedule(view.payment.product.eventAt) },
                  { label: "장소", value: view.payment.product.address },
                  { label: "결제 금액", value: formatPrice(view.payment.amount), emphasis: true },
                ]}
              />
            ) : (
              <div className={cn(formContainer, "flex flex-col gap-[var(--spacing-12)]")}>
                {[0, 1, 2, 3].map((row) => (
                  <Skeleton key={row} variant="text" typography="body-md" />
                ))}
              </div>
            )}
            <div aria-hidden className="h-2 bg-[var(--color-background-subtle)]" />
          </section>
          {view.status === "paid" && (
            <div className={cn(formContainer, "mt-auto")}>
              <ViewPaymentsButton />
            </div>
          )}
        </main>
      )}
    </>
  );
}

/** 결제로 참여 인원이 바뀌었으니 상세는 서버 값으로 덮고, 목록 · 결제 내역은 다음 진입 때 다시 받는다 */
function syncProductCache(product: Product) {
  writeBff(`/api/products/${encodeURIComponent(product.id)}`, product);
  invalidateBff("/api/products");
  invalidatePayments();
}
