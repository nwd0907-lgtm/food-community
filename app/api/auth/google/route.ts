import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/google: Supabase OAuth URL을 받아 Google 동의 화면으로 303 리다이렉트
// PKCE code verifier 쿠키는 createClient의 setAll이 이 응답에 실어 보낸다
export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/api/auth/callback` },
  });

  if (error || !data.url) return NextResponse.redirect(`${origin}/login?error=oauth`, 303);
  return NextResponse.redirect(data.url, 303);
}
