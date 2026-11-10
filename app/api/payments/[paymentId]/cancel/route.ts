import { NextResponse, type NextRequest } from "next/server";
import { Payment } from "@portone/server-sdk";
import { PAYMENT_TYPE, type PaymentCancelResponse } from "@/lib/payment";
import { createPortOnePaymentClient } from "@/lib/portone";
import { fail } from "@/lib/supabase/payment";
import { syncCancelledPayment, UUID } from "@/lib/supabase/payment-sync";
import { getUserId } from "@/lib/supabase/place";
import { fetchParticipantCounts, toProduct } from "@/lib/supabase/product";
import { createClient } from "@/lib/supabase/server";

// POST /api/payments/{paymentId}/cancel: 내 결제 전액 취소 (.claude/rules/payment.md § 7 결제 취소 API)
// 1) 로그인 · 내 원장(RLS)에 PAID 있고 CANCELLED 없음 · 행사 시작 전
// 2) 포트원 cancelPayment(전액, 취소 가능 잔액 = PAID 금액일 때만) → 실패하면 원장에 쓰지 않는다
// 3) 재조회해 CANCELLED 확인 → record_payment(CANCELLED, −PAID 금액). 웹훅과 겹쳐도 (transaction_key, CANCELLED) 멱등으로 한 행
type SnapshotProduct = { event_at?: string };

export async function POST(_request: NextRequest, ctx: RouteContext<"/api/payments/[paymentId]/cancel">) {
  const { paymentId } = await ctx.params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });
  if (!UUID.test(paymentId)) return fail(400, { message: "잘못된 결제 정보예요." });

  // 내 원장 행만 보인다 (RLS). 남의 결제는 404와 구분하지 않는다
  const { data: rows, error } = await supabase
    .from("payment")
    .select("*, payment_snaphost(snapshot_product)")
    .eq("transaction_key", paymentId)
    .eq("user_id", userId);
  if (error) return fail(500, { message: "결제 내역을 불러오지 못했어요." });
  const paidRow = rows.find((row) => row.type === PAYMENT_TYPE.paid);
  if (!paidRow) return fail(404, { message: "결제 내역을 찾을 수 없어요." });
  if (rows.some((row) => row.type === PAYMENT_TYPE.cancelled)) return fail(409, { message: "이미 취소된 결제예요." });

  // 행사 시작 전까지만 취소. 현재 상품 일정(공개 상품) → 없으면 결제 시점 스냅샷 일정
  const { data: current } = await supabase.from("product").select("event_at").eq("id", paidRow.product_id).maybeSingle();
  const eventAt = current?.event_at ?? (paidRow.payment_snaphost?.snapshot_product as SnapshotProduct | null)?.event_at;
  if (eventAt && Date.now() >= new Date(eventAt).getTime())
    return fail(409, { message: "수업이 시작되어 취소할 수 없어요." });

  const paid = { ...paidRow, payment_snaphost: undefined };
  const paidAmount = Number(paid.amount);

  // 포트원 전액 취소. 이미 포트원에서 취소된 결제(콘솔 · 다른 요청)는 그대로 기록 단계로 넘어간다
  let portone;
  try {
    portone = createPortOnePaymentClient();
  } catch (configError) {
    console.error("[payments/cancel] 결제 환경변수 누락", configError);
    return fail(500, { message: "결제 설정이 없어요. 관리자에게 문의해 주세요." });
  }
  try {
    await portone.cancelPayment({
      paymentId,
      reason: "고객 요청 취소",
      requester: "CUSTOMER",
      currentCancellableAmount: paidAmount,
    });
  } catch (cancelError) {
    const type = cancelError instanceof Payment.PaymentError ? cancelError.data.type : undefined;
    if (type !== "PAYMENT_ALREADY_CANCELLED") {
      console.error("[payments/cancel] 포트원 취소 실패", paymentId, type, cancelError);
      if (type === "PAYMENT_NOT_FOUND") return fail(404, { message: "결제 내역을 찾을 수 없어요." });
      if (type === "PAYMENT_NOT_PAID" || type === "CANCELLABLE_AMOUNT_CONSISTENCY_BROKEN")
        return fail(409, { message: "취소할 수 없는 결제예요. 고객센터로 문의해 주세요." });
      return fail(502, { message: "결제를 취소하지 못했어요. 잠시 후 다시 시도해 주세요." });
    }
  }

  // 재조회 → CANCELLED 확인 → 원장 기록 (웹훅과 같은 함수)
  const result = await syncCancelledPayment(paymentId, paid);
  if (!result.ok) {
    // 포트원은 취소됐는데 기록 못 함 → 웹훅(Transaction.Cancelled)이 다시 기록을 시도한다
    console.warn("[payments/cancel] 취소 기록 실패", paymentId, result.kind, result.message);
    return fail(result.status >= 500 ? 502 : result.status, {
      message: result.kind === "RETRYABLE" ? "취소는 접수됐어요. 잠시 후 결제 내역을 확인해 주세요." : result.message,
    });
  }

  const { recorded, payment, product } = result;
  const counts = await fetchParticipantCounts(supabase, [product.id]).catch(() => new Map<string, number>());
  const response: PaymentCancelResponse = {
    paymentId,
    amount: Math.abs(Number(recorded.amount)),
    cancelledAt: payment.cancelledAt,
    product: toProduct(product, counts.get(product.id)),
  };
  return NextResponse.json(response);
}
