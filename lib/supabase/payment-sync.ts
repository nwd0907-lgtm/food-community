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

// ─── 결제 취소 (.claude/rules/payment.md § 7 취소 API · § 8 취소 웹훅) ───────────────────────────────

export type CancelSyncSuccess = {
  ok: true;
  recorded: PaymentRow;
  payment: Payment.CancelledPayment;
  /** 기록 시점 상품 행 (스냅샷과 같은 값) */
  product: ProductRow;
};

/** 같은 transaction_key의 PAID 원장 행. 없으면 null (우리 원장에 기록된 결제가 아님) */
export async function findPaidRow(paymentId: string) {
  const { data, error } = await createAdminClient()
    .from("payment")
    .select("*")
    .eq("transaction_key", paymentId)
    .eq("type", PAYMENT_TYPE.paid)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * 포트원에서 취소된 결제를 원장에 CANCELLED로 기록. 취소 API(취소 후 재조회)와 웹훅이 같이 쓴다
 * - 포트원 상태가 CANCELLED가 아니면 IGNORE (부분 취소 · 취소 대기 포함)
 * - 상점 · 채널이 다르면 IGNORE
 * - 기록된 PAID가 없으면 IGNORE (원장 순액 0 유지)
 * - 취소 금액(amount.cancelled) ≠ PAID 금액이면 REFUND (운영자 확인)
 * - record_payment(CANCELLED, −PAID.amount, PAID 행의 상품 · 사용자, 스냅샷 = 조회 응답 + 현재 상품 행). (transaction_key, CANCELLED) 멱등
 * @param paid 호출 쪽에서 이미 읽은 PAID 행 (없으면 여기서 읽는다)
 */
export async function syncCancelledPayment(
  paymentId: string,
  paid?: PaymentRow,
): Promise<CancelSyncSuccess | SyncFailure> {
  const config = portoneConfig();
  const admin = createAdminClient();

  // 1) 포트원 단건 조회 (웹훅 본문 · 브라우저 값은 믿지 않는다)
  let payment;
  try {
    payment = await createPortOnePaymentClient().getPayment({ paymentId });
  } catch (error) {
    if (error instanceof Payment.PaymentError && error.data.type === "PAYMENT_NOT_FOUND")
      return failure("NOT_FOUND", 404, "결제 내역을 찾을 수 없어요.");
    console.error("[payments/cancel-sync] 포트원 조회 실패", paymentId, error);
    return failure("RETRYABLE", 502, "취소 확인에 실패했어요. 잠시 후 다시 시도해 주세요.");
  }

  // 2) 상태 · 상점 · 채널
  if (payment.status !== "CANCELLED") return failure("IGNORE", 409, "결제가 취소되지 않았어요.");
  if (payment.storeId !== config.storeId || payment.channel?.key !== config.channelKey)
    return failure("IGNORE", 400, "결제 정보가 올바르지 않아요.");

  // 3) 우리 원장의 PAID 행
  let paidRow = paid ?? null;
  if (!paidRow) {
    try {
      paidRow = await findPaidRow(paymentId);
    } catch {
      return failure("RETRYABLE", 500, "취소 확인에 실패했어요. 다시 시도해 주세요.");
    }
  }
  if (!paidRow) return failure("IGNORE", 404, "기록된 결제가 없어요.");

  // 4) 전액 취소만 지원: 포트원 취소 금액 = 원장 PAID 금액
  const paidAmount = Number(paidRow.amount);
  if (payment.amount.cancelled !== paidAmount) return failure("REFUND", 409, "취소 금액이 결제 금액과 달라요.");

  // 5) 스냅샷용 현재 상품 행 (비공개로 바뀌었어도 취소 기록은 남긴다)
  const { data: product, error: productError } = await admin
    .from("product")
    .select("*")
    .eq("id", paidRow.product_id)
    .maybeSingle();
  if (productError || !product) return failure("RETRYABLE", 500, "취소 기록에 실패했어요. 다시 시도해 주세요.");

  const { data: recorded, error: recordError } = await admin.rpc("record_payment", {
    p_transaction_key: paymentId,
    p_type: PAYMENT_TYPE.cancelled,
    p_amount: signedAmount(PAYMENT_TYPE.cancelled, paidAmount),
    p_product_id: paidRow.product_id,
    p_user_id: paidRow.user_id,
    p_snapshot_payment: payment as unknown as Json,
    p_snapshot_product: product as unknown as Json,
  });
  if (recordError || !recorded) {
    console.error("[payments/cancel-sync] record_payment 실패", paymentId, recordError);
    return failure("RETRYABLE", 500, "취소 기록에 실패했어요. 고객센터로 문의해 주세요.");
  }
  return { ok: true, recorded, payment, product };
}
