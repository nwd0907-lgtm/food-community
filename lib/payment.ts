// 결제 BFF(/api/payments/**) 요청·응답 타입. 클라이언트·서버 공용 (Supabase · PortOne 서버 의존 없음)
// 결제 규칙 SSOT: .claude/rules/payment.md
import type { Product } from "./product";

/** payment.type: 원장 행 종류. amount 부호는 PAID +, CANCELLED − (transaction_key별 합계 = 순결제액) */
export const PAYMENT_TYPE = { paid: "PAID", cancelled: "CANCELLED" } as const;
export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

/** 결제는 원화 · 카드 · 1인 1자리 */
export const PAYMENT_CURRENCY = "KRW";
export const PAYMENT_PAY_METHOD = "CARD";
export const SEATS_PER_PERSON = 1;

/** PortOne.requestPayment customData. 서버 검증 때 그대로 대조한다 */
export type PaymentCustomData = { productId: string; userId: string };

/** POST /api/payments/prepare 응답: 결제창에 그대로 넘길 값 (금액 · 상품명은 서버가 DB에서 정한다) */
export type PaymentPrepareResponse = {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  customData: PaymentCustomData;
};

/** POST /api/payments/complete 응답: 검증 후 원장에 기록된 결제 */
export type PaymentCompleteResponse = {
  /** 포트원 결제 아이디 (= payment.transaction_key) */
  paymentId: string;
  amount: number;
  paidAt: string;
  product: Product;
};

/** 4xx · 5xx 응답 */
export type PaymentError = { message: string };
