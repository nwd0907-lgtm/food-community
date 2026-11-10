import "server-only";
import { Payment } from "@portone/server-sdk";
import { PAYMENT_CURRENCY, PAYMENT_TYPE, type PaymentCustomData, type PaymentType } from "@/lib/payment";
import { createPortOnePaymentClient, portoneConfig } from "@/lib/portone";
import { createAdminClient } from "./admin";
import type { Database, Json } from "./database.types";
import { PRODUCT_STATUS_PUBLIC } from "./product";

// 포트원 결제 단건 조회 → 검증 → record_payment. 완료 페이지(complete)와 웹훅(webhook)이 같이 쓴다
// 규칙 SSOT: .claude/rules/payment.md § 결제 검증·기록

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PaymentRow = Database["public"]["Tables"]["payment"]["Row"];
type ProductRow = Database["public"]["Tables"]["product"]["Row"];

/** 원장 금액 부호: 결제 +, 취소 − (transaction_key별 합계 = 순결제액) */
export function signedAmount(type: PaymentType, amount: number) {
  return type === PAYMENT_TYPE.paid ? Math.abs(amount) : -Math.abs(amount);
}

/**
 * 실패 사유
 * - RETRYABLE: 포트원 · DB 일시 오류 (웹훅은 5xx로 재시도 받는다)
 * - REFUND: 돈은 나갔는데 검증 실패 (금액 불일치 · 비공개 상품) → 취소 대상
 * - IGNORE: 기록할 것이 없음 (미결제 · 다른 상점/채널 · 잘못된 customData)
 * - FORBIDDEN: 로그인 사용자의 결제가 아님 (완료 페이지만)
 */
export type SyncFailure = { ok: false; kind: "RETRYABLE" | "REFUND" | "IGNORE" | "FORBIDDEN" | "NOT_FOUND"; status: number; message: string };
export type SyncSuccess = {
  ok: true;
  recorded: PaymentRow;
  payment: Payment.PaidPayment;
  product: ProductRow;
  /** 같은 사용자 · 같은 상품에 이미 참여 중인데 또 결제됨 (다른 paymentId) → 취소 대상 */
  duplicate: boolean;
};

const failure = (kind: SyncFailure["kind"], status: number, message: string): SyncFailure => ({ ok: false, kind, status, message });

/**
 * PAID 결제 동기화. 같은 paymentId로 몇 번을 불러도 원장 행은 하나 (record_payment 멱등)
 * @param sessionUserId 완료 페이지: 로그인 사용자 (customData.userId와 다르면 403). 웹훅: 생략 → customData.userId 사용
 */
export async function syncPaidPayment(paymentId: string, sessionUserId?: string): Promise<SyncSuccess | SyncFailure> {
  const config = portoneConfig();
  const admin = createAdminClient();

  // 1) 포트원 단건 조회 (브라우저 · 웹훅 본문의 금액 · 상태는 믿지 않는다)
  let payment;
  try {
    payment = await createPortOnePaymentClient().getPayment({ paymentId });
  } catch (error) {
    if (error instanceof Payment.PaymentError && error.data.type === "PAYMENT_NOT_FOUND")
      return failure("NOT_FOUND", 404, "결제 내역을 찾을 수 없어요.");
    console.error("[payments/sync] 포트원 조회 실패", paymentId, error);
    return failure("RETRYABLE", 502, "결제 확인에 실패했어요. 잠시 후 다시 시도해 주세요.");
  }

  // 2) 상태 · 상점 · 채널
  if (payment.status !== "PAID") return failure("IGNORE", 400, "결제가 완료되지 않았어요.");
  if (payment.storeId !== config.storeId || payment.channel?.key !== config.channelKey)
    return failure("IGNORE", 400, "결제 정보가 올바르지 않아요.");

  // 3) customData: 구매자 · 상품
  let customData: Partial<PaymentCustomData> = {};
  try {
    customData = JSON.parse(payment.customData ?? "{}");
  } catch {
    return failure("REFUND", 400, "결제 정보가 올바르지 않아요.");
  }
  if (typeof customData.userId !== "string" || !UUID.test(customData.userId))
    return failure("REFUND", 400, "결제 정보가 올바르지 않아요.");
  if (sessionUserId !== undefined && customData.userId !== sessionUserId)
    return failure("FORBIDDEN", 403, "내 결제만 확인할 수 있어요.");
  if (typeof customData.productId !== "string" || !UUID.test(customData.productId))
    return failure("REFUND", 400, "결제 정보가 올바르지 않아요.");
  const userId = customData.userId;

  // 4) 상품 (스냅샷용 행 전체) · 금액 대조
  const { data: product, error: productError } = await admin
    .from("product")
    .select("*")
    .eq("id", customData.productId)
    .maybeSingle();
  if (productError) return failure("RETRYABLE", 500, "결제 확인에 실패했어요. 다시 시도해 주세요.");
  if (!product || product.status !== PRODUCT_STATUS_PUBLIC) return failure("REFUND", 409, "판매 중인 상품이 아니에요.");
  if (
    payment.orderName !== product.name ||
    payment.amount.total !== Number(product.price) ||
    payment.currency !== PAYMENT_CURRENCY
  )
    return failure("REFUND", 400, "결제 금액이 상품 가격과 달라요.");

  // 5) 기록: 스냅샷 + 원장 한 트랜잭션, (transaction_key, type) 멱등 → 완료 페이지 · 웹훅 · 재시도가 겹쳐도 한 행
  const { data: recorded, error: recordError } = await admin.rpc("record_payment", {
    p_transaction_key: paymentId,
    p_type: PAYMENT_TYPE.paid,
    p_amount: signedAmount(PAYMENT_TYPE.paid, payment.amount.total),
    p_product_id: product.id,
    p_user_id: userId,
    p_snapshot_payment: payment as unknown as Json,
    p_snapshot_product: product as unknown as Json,
  });
  if (recordError || !recorded) {
    console.error("[payments/sync] record_payment 실패", paymentId, recordError);
    return failure("RETRYABLE", 500, "결제 기록에 실패했어요. 고객센터로 문의해 주세요.");
  }

  // 6) 중복 결제: 같은 사용자 · 상품의 활성 결제(PAID − CANCELLED)가 2건 이상. 돈이 나갔으므로 기록은 두고 취소 대상으로 남긴다
  const duplicate = await countActivePayments(admin, userId, product.id).then((n) => n > 1, () => false);
  if (duplicate) console.warn("[payments/sync] 중복 결제 — 취소 대상", { paymentId, userId, productId: product.id });

  return { ok: true, recorded, payment, product, duplicate };
}

async function countActivePayments(admin: ReturnType<typeof createAdminClient>, userId: string, productId: string) {
  const { data, error } = await admin.from("payment").select("type").eq("user_id", userId).eq("product_id", productId);
  if (error) throw error;
  return data.reduce((n, row) => n + (row.type === PAYMENT_TYPE.paid ? 1 : -1), 0);
}
