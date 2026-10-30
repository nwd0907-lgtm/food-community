import { NextResponse, type NextRequest } from "next/server";
import { fail, getUserId } from "@/lib/supabase/place";
import { createClient } from "@/lib/supabase/server";
import { searchLocal } from "@/lib/naver";

// GET /api/location/search?query=: 장소 검색 (NAVER 지역 검색, 최대 5건). 로그인 사용자만
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!(await getUserId(supabase))) return fail(401, { message: "로그인이 필요해요." });

  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (!query) return NextResponse.json([]);
  if (query.length > 50) return fail(400, { message: "검색어는 50자 이내로 입력해 주세요." });

  try {
    return NextResponse.json(await searchLocal(query));
  } catch {
    return fail(502, { message: "장소를 검색하지 못했어요. 다시 시도해 주세요." });
  }
}
