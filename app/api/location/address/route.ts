import { NextResponse, type NextRequest } from "next/server";
import { fail, getUserId } from "@/lib/supabase/place";
import { createClient } from "@/lib/supabase/server";
import { reverseGeocode } from "@/lib/naver";

// GET /api/location/address?latitude=&longitude=: 지도 중심 좌표의 주소 (NAVER 역지오코딩). 로그인 사용자만
// 주소가 없는 좌표(바다 등)는 { address: null }
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (!(await getUserId(supabase))) return fail(401, { message: "로그인이 필요해요." });

  const params = request.nextUrl.searchParams;
  const latitude = Number(params.get("latitude") || NaN);
  const longitude = Number(params.get("longitude") || NaN);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)
    return fail(400, { message: "위치를 다시 선택해 주세요." });

  try {
    return NextResponse.json({ address: await reverseGeocode(latitude, longitude) });
  } catch {
    return fail(502, { message: "주소를 찾지 못했어요. 다시 시도해 주세요." });
  }
}
