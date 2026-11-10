"use client";

import { useSyncExternalStore } from "react";
import { samplePayments, type Payment } from "./payment-mock";

// 결제 내역 목업 저장소 (탭 이동 · 화면 이동 사이에 결제 · 취소 결과를 유지, 새로고침하면 처음 목업으로 돌아간다)
// TODO(결제 연동): 결제 확인 · 취소는 BFF(POST /api/payments, POST /api/payments/[id]/cancel)에서 PG와 대조한 뒤 처리하고,
// 이 저장소는 lib/bff의 useBff("/api/payments") 캐시로 바꾼다

let payments: Payment[] = samplePayments;
const listeners = new Set<() => void>();

function emit(next: Payment[]) {
  payments = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 결제 · 취소 내역 (최신순) */
export function usePayments() {
  const all = useSyncExternalStore(subscribe, () => payments, () => samplePayments);
  const byLatest = (date: (payment: Payment) => string) => (a: Payment, b: Payment) => date(b).localeCompare(date(a));
  return {
    paid: all.filter((payment) => payment.status === "paid").sort(byLatest((payment) => payment.paidAt)),
    canceled: all
      .filter((payment) => payment.status === "canceled")
      .sort(byLatest((payment) => payment.canceledAt ?? payment.paidAt)),
  };
}

/** 결제 완료(목업). 이미 결제한 상품이면 그대로 둔다 (한 사람이 상품 하나당 1자리) */
export function completeMockPayment(productId: string, amount: number) {
  if (payments.some((payment) => payment.productId === productId && payment.status === "paid")) return;
  emit([
    { id: `pay-${Date.now()}`, productId, amount, status: "paid", paidAt: new Date().toISOString() },
    ...payments,
  ]);
}

/** 결제 취소(목업): 결제 내역에서 취소 내역으로 옮긴다 */
export function cancelMockPayment(paymentId: string) {
  emit(
    payments.map((payment) =>
      payment.id === paymentId ? { ...payment, status: "canceled", canceledAt: new Date().toISOString() } : payment,
    ),
  );
}
