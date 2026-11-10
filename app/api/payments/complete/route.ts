import { NextResponse } from "next/server";
import type { PaymentCompleteResponse } from "@/lib/payment";
import { fail } from "@/lib/supabase/payment";
import { syncPaidPayment, UUID } from "@/lib/supabase/payment-sync";
import { getUserId } from "@/lib/supabase/place";
import { fetchParticipantCounts, toProduct } from "@/lib/supabase/product";
import { createClient } from "@/lib/supabase/server";

// POST /api/payments/complete { paymentId }: 결제창이 끝난 뒤 서버 검증 + 원장 기록 (.claude/rules/payment.md § 결제 검증·기록)
// 검증 · 기록은 웹훅과 같은 syncPaidPayment. 같은 paymentId로 다시 불러도(새로고침 · 리다이렉트 · 웹훅 선도착) 기존 기록을 돌려준다
export async function POST(request: Request) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });

  const body = (await request.json().catch(() => null)) as { paymentId?: unknown } | null;
  const paymentId = typeof body?.paymentId === "string" ? body.paymentId : "";
  if (!UUID.test(paymentId)) return fail(400, { message: "잘못된 결제 정보예요." });

  let result;
  try {
    result = await syncPaidPayment(paymentId, userId);
  } catch (error) {
    console.error("[payments/complete] 결제 환경변수 누락", error);
    return fail(500, { message: "결제 설정이 없어요. 관리자에게 문의해 주세요." });
  }
  if (!result.ok) {
    if (result.kind === "REFUND") console.warn("[payments/complete] 검증 실패 — 취소 대상", paymentId, result.message);
    return fail(result.status, { message: result.message });
  }

  const { recorded, payment, product } = result;
  const counts = await fetchParticipantCounts(supabase, [product.id]).catch(() => new Map<string, number>());
  const response: PaymentCompleteResponse = {
    paymentId,
    amount: Number(recorded.amount),
    paidAt: payment.paidAt,
    product: toProduct(product, counts.get(product.id)),
  };
  return NextResponse.json(response);
}
