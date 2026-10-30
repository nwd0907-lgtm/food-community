import { NextResponse, type NextRequest } from "next/server";

// 로그인 쿠키가 아예 없으면 화면을 내려보내기 전에 로그인으로 보낸다.
// 쿠키 존재만 보고 Supabase는 호출하지 않는다(만료 · 위조 검증은 BFF가 하고, 401이면 클라이언트가 로그인으로 보낸다)
// Supabase 세션 쿠키: sb-<project-ref>-auth-token (길면 .0 .1 … 로 나뉜다)
const SESSION_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

export function proxy(request: NextRequest) {
  const loggedIn = request.cookies.getAll().some(({ name }) => SESSION_COOKIE.test(name));
  if (loggedIn) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // 로그인이 필요한 화면만. /login · /api · 정적 파일 · 스플래시 등은 제외
  matcher: ["/", "/my/:path*", "/restaurants/:path*"],
};
