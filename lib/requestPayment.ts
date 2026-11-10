"use client";

import {
  PAYMENT_CURRENCY,
  PAYMENT_PAY_METHOD,
  type PaymentError,
  type PaymentPrepareResponse,
} from "./payment";

// 결제창 열기 (.claude/rules/payment.md § 결제 요청)
// 1) BFF POST /api/payments/prepare로 서버 확인 · 결제 값 받기 → 2) PortOne.requestPayment
// redirectUrl이 있으면 모바일은 결제 완료 페이지로 리다이렉트되고(?paymentId&code&message), PC는 반환값으로 결과가 온다
// 두 흐름 모두 결제 완료 페이지에서 BFF POST /api/payments/complete로 검증한다

export type RequestPayResult =
  /** 결제창에서 결제를 마쳤다. 완료 페이지로 이동해 서버 검증 */
  | { ok: true; completeUrl: string }
  /** 결제창을 열기 전에 막혔거나(로그인 · 마감 · 이미 참여 등) 결제창에서 취소 · 실패했다 */
  | { ok: false; message: string; status?: number };

export function completePath(productId: string) {
  return `/products/${encodeURIComponent(productId)}/complete`;
}

export async function requestPay(productId: string): Promise<RequestPayResult> {
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
  if (!storeId || !channelKey) return { ok: false, message: "결제 설정이 없어요. 관리자에게 문의해 주세요." };

  const prepare = await fetch("/api/payments/prepare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  }).catch(() => null);
  if (!prepare) return { ok: false, message: "네트워크 연결을 확인해 주세요." };
  if (!prepare.ok) {
    const error = (await prepare.json().catch(() => null)) as PaymentError | null;
    return { ok: false, status: prepare.status, message: error?.message ?? "결제를 준비하지 못했어요." };
  }
  const { paymentId, orderName, totalAmount, customData } = (await prepare.json()) as PaymentPrepareResponse;

  // SDK는 결제할 때만 받는다 (상세 화면 첫 로드를 가볍게)
  const { default: PortOne } = await import("@portone/browser-sdk/v2");
  const path = completePath(productId);
  const response = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId,
    orderName,
    totalAmount,
    currency: PAYMENT_CURRENCY,
    payMethod: PAYMENT_PAY_METHOD,
    redirectUrl: `${window.location.origin}${path}`,
    customData,
  }).catch((error: unknown) => ({
    paymentId,
    code: "SDK_ERROR",
    message: error instanceof Error ? error.message : "결제창을 열지 못했어요.",
  }));

  // 모바일은 결제창이 redirectUrl로 페이지를 옮기므로 반환값이 없다. 이동을 기다린다 (버튼은 계속 로딩)
  if (!response) return new Promise<never>(() => {});
  // 결제창에서 취소 · 실패: 상세에 머물며 문구를 보여 준다 (모바일 리다이렉트 실패는 완료 페이지가 ?code로 보여 준다)
  if (response?.code) return { ok: false, message: response.message ?? "결제가 완료되지 않았어요." };
  return { ok: true, completeUrl: `${path}?${new URLSearchParams({ paymentId: response.paymentId })}` };
}
