import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { cookies } from "next/headers";

// BFF(Route Handler) 전용 Supabase 클라이언트. 요청마다 새로 만든다 (쿠키가 요청 단위)
export async function createClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY 환경변수가 필요합니다");

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // Route Handler에서는 쿠키 쓰기가 가능하므로 토큰 갱신 결과를 그대로 응답 쿠키에 반영
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
