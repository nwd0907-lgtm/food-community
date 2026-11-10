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

/** POST /api/payments/{paymentId}/cancel 응답: 포트원 전액 취소 후 원장에 기록된 취소 */
export type PaymentCancelResponse = {
  /** 포트원 결제 아이디 (= payment.transaction_key) */
  paymentId: string;
  /** 취소(환불) 금액 (양수. 화면용) */
  amount: number;
  cancelledAt: string;
  /** 취소 후 현재 상품 (참여 인원 반영). 상품 상세 캐시를 이 값으로 덮는다 */
  product: Product;
};

/** GET /api/payments 항목: 결제 한 건(transaction_key) = PAID 행 + (있으면) CANCELLED 행. 상품 정보는 결제 시점 스냅샷 */
export type PaymentHistoryItem = {
  /** 포트원 결제 아이디 (= payment.transaction_key) */
  paymentId: string;
  /** CANCELLED 행이 있으면 CANCELLED */
  status: PaymentType;
  /** 결제 금액 (양수. 원장의 부호와 상관없이 화면용) */
  amount: number;
  paidAt: string;
  cancelledAt: string | null;
  product: {
    id: string;
    name: string;
    eventAt: string;
    address: string;
    thumbnailUrl: string;
    capacity: number;
    /** 현재 참여 인원 (스냅샷이 아니라 지금 값) */
    participants: number;
  };
};

/** 4xx · 5xx 응답 */
export type PaymentError = { message: string };
