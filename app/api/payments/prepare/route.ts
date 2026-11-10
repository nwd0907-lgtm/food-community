import { NextResponse } from "next/server";
import type { PaymentPrepareResponse } from "@/lib/payment";
import { fail, hasActivePayment } from "@/lib/supabase/payment";
import { getUserId } from "@/lib/supabase/place";
import { fetchParticipantCounts, fetchPublicProduct } from "@/lib/supabase/product";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/payments/prepare { productId }: 결제창을 열기 전 서버 확인 (.claude/rules/payment.md § 결제 요청)
// 공개 상품인지, 이미 참여 중인지, 자리가 남았는지 확인하고 결제창에 넘길 값을 정한다
// paymentId는 서버가 uuid로 만들고, 금액 · 상품명은 DB 값만 쓴다 (브라우저 값을 믿지 않는다)
export async function POST(request: Request) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });

  const body = (await request.json().catch(() => null)) as { productId?: unknown } | null;
  const productId = typeof body?.productId === "string" ? body.productId : "";
  if (!UUID.test(productId)) return fail(400, { message: "잘못된 요청이에요." });

  try {
    const product = await fetchPublicProduct(supabase, productId);
    if (!product) return fail(404, { message: "판매 중인 상품이 아니에요." });
    if (await hasActivePayment(supabase, userId, productId)) return fail(409, { message: "이미 참여 신청한 수업이에요." });
    const participants = (await fetchParticipantCounts(supabase, [productId])).get(productId) ?? 0;
    if (participants >= product.capacity) return fail(409, { message: "정원이 모두 찼어요." });

    const response: PaymentPrepareResponse = {
      paymentId: crypto.randomUUID(),
      orderName: product.name,
      totalAmount: Number(product.price),
      customData: { productId, userId },
    };
    return NextResponse.json(response);
  } catch {
    return fail(500, { message: "결제를 준비하지 못했어요. 다시 시도해 주세요." });
  }
}
