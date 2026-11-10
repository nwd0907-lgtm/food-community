import { Webhook } from "@portone/server-sdk";
import { syncPaidPayment, UUID } from "@/lib/supabase/payment-sync";

// POST /api/payments/webhook: 포트원 V2 결제 웹훅 (.claude/rules/payment.md § 웹훅)
// 서명 검증 → paymentId만 꺼내 완료 페이지와 같은 검증(syncPaidPayment) → record_payment(멱등)
// 응답: 서명 실패 400 · 일시 오류 500(포트원 재시도) · 그 밖에는 처리할 것이 없어도 200
export async function POST(request: Request) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[payments/webhook] PORTONE_WEBHOOK_SECRET 환경변수가 필요합니다");
    return new Response(null, { status: 500 });
  }

  // 서명은 원문 기준이므로 JSON 파싱 전 문자열 그대로 검증한다
  const body = await request.text();
  let webhook;
  try {
    webhook = await Webhook.verify(secret, body, Object.fromEntries(request.headers));
  } catch (error) {
    if (error instanceof Webhook.WebhookVerificationError) return new Response(null, { status: 400 });
    throw error;
  }

  // 결제 승인만 처리. 취소(Transaction.Cancelled)는 추후 구현, 모르는 type은 무시
  if (webhook.type !== "Transaction.Paid") return new Response(null, { status: 200 });

  const { paymentId } = webhook.data;
  // 우리 결제는 서버가 만든 uuid만 쓴다 (transaction_key uuid 컬럼)
  if (!UUID.test(paymentId)) return new Response(null, { status: 200 });

  let result;
  try {
    result = await syncPaidPayment(paymentId);
  } catch (error) {
    console.error("[payments/webhook] 결제 환경변수 누락", error);
    return new Response(null, { status: 500 });
  }

  if (!result.ok) {
    if (result.kind === "RETRYABLE") return new Response(null, { status: 500 });
    if (result.kind === "REFUND") console.warn("[payments/webhook] 검증 실패 — 취소 대상", paymentId, result.message);
    else console.info("[payments/webhook] 기록할 것 없음", paymentId, result.message);
  }
  return new Response(null, { status: 200 });
}
