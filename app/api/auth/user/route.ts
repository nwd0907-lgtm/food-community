import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/auth/user: 현재 로그인 사용자 (없으면 null). getClaims()는 JWT 서명을 검증하므로 서버에서 신뢰 가능
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error) return NextResponse.json({ user: null, error: error.message }, { status: 401 });
  return NextResponse.json({ user: data?.claims ?? null });
}
