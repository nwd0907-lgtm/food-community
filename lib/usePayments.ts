"use client";

import { invalidateBff, useBff, writeBff } from "./bff";
import { PAYMENT_TYPE, type PaymentCancelResponse, type PaymentError, type PaymentHistoryItem } from "./payment";

// 마이페이지 결제 내역 · 취소 내역: BFF GET /api/payments (.claude/rules/payment.md § 화면·캐시)
export const PAYMENTS_URL = "/api/payments";

/** 결제 내역(최신 결제순) · 취소 내역(최신 취소순). 받기 전에는 undefined */
export function usePayments() {
  const { data, status } = useBff<PaymentHistoryItem[]>(PAYMENTS_URL);
  const latest = (date: (item: PaymentHistoryItem) => string) => (a: PaymentHistoryItem, b: PaymentHistoryItem) =>
    date(b).localeCompare(date(a));
  return {
    status,
    paid: data?.filter((item) => item.status === PAYMENT_TYPE.paid).sort(latest((item) => item.paidAt)),
    canceled: data
      ?.filter((item) => item.status === PAYMENT_TYPE.cancelled)
      .sort(latest((item) => item.cancelledAt ?? item.paidAt)),
  };
}

/** 결제 · 취소 뒤 결제 내역을 다시 받도록 표시 */
export function invalidatePayments() {
  invalidateBff(PAYMENTS_URL);
}

export type CancelPaymentResult =
  | { ok: true; cancel: PaymentCancelResponse }
  | { ok: false; status: number; message: string };

/**
 * POST /api/payments/{paymentId}/cancel (전액 취소)
 * 성공하면 결제 내역의 그 건을 바로 취소 내역으로 옮기고(서버 응답 값), 상품 상세는 서버 응답으로 덮고, 목록 · 결제 내역은 서버에서 다시 받는다
 */
export async function cancelPayment(paymentId: string): Promise<CancelPaymentResult> {
  let response: Response;
  try {
    response = await fetch(`${PAYMENTS_URL}/${encodeURIComponent(paymentId)}/cancel`, { method: "POST" });
  } catch {
    return { ok: false, status: 0, message: "네트워크 연결을 확인해 주세요." };
  }
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as PaymentError | null;
    return { ok: false, status: response.status, message: error?.message ?? "결제를 취소하지 못했어요." };
  }

  const cancel = (await response.json()) as PaymentCancelResponse;
  writeBff<PaymentHistoryItem[]>(PAYMENTS_URL, (items) =>
    items.map((item) => {
      const product =
        item.product.id === cancel.product.id ? { ...item.product, participants: cancel.product.participants } : item.product;
      return item.paymentId === cancel.paymentId
        ? { ...item, status: PAYMENT_TYPE.cancelled, cancelledAt: cancel.cancelledAt, product }
        : { ...item, product };
    }),
  );
  writeBff(`/api/products/${encodeURIComponent(cancel.product.id)}`, cancel.product);
  invalidateBff("/api/products");
  invalidatePayments();
  return { ok: true, cancel };
}
