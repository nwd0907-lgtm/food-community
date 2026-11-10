import { NextResponse, type NextRequest } from "next/server";
import { getUserId } from "@/lib/supabase/place";
import { fail, fetchParticipantCounts, fetchPublicProduct, toProduct } from "@/lib/supabase/product";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/products/[id]: 상품 상세 (참여 인원 포함). 없거나 공개가 아니면 404
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/products/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });
  if (!UUID.test(id)) return fail(404, { message: "상품을 찾을 수 없어요." });

  try {
    const row = await fetchPublicProduct(supabase, id);
    if (!row) return fail(404, { message: "상품을 찾을 수 없어요." });
    const counts = await fetchParticipantCounts(supabase, [row.id]);
    return NextResponse.json(toProduct(row, counts.get(row.id)));
  } catch {
    return fail(500, { message: "상품을 불러오지 못했어요." });
  }
}
