import { NextResponse } from "next/server";
import { getUserId } from "@/lib/supabase/place";
import { fail, fetchParticipantCounts, PRODUCT_SELECT, PRODUCT_STATUS_PUBLIC, toProduct } from "@/lib/supabase/product";
import { createClient } from "@/lib/supabase/server";

// GET /api/products: 공개 상품 목록 (일시 빠른 순, 참여 인원 포함). 메인 상단 배너에 쓴다
export async function GET() {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });

  const { data, error } = await supabase
    .from("product")
    .select(PRODUCT_SELECT)
    .eq("status", PRODUCT_STATUS_PUBLIC)
    .order("event_at", { ascending: true });
  if (error) return fail(500, { message: "상품을 불러오지 못했어요." });

  try {
    const counts = await fetchParticipantCounts(supabase, data.map((row) => row.id));
    return NextResponse.json(data.map((row) => toProduct(row, counts.get(row.id))));
  } catch {
    return fail(500, { message: "상품을 불러오지 못했어요." });
  }
}
