import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// service_role(secret key) 클라이언트: RLS를 우회한다. 결제 원장 기록(record_payment)에만 쓴다 (.claude/rules/payment.md)
// 사용자 세션과 섞이지 않도록 쿠키 · 세션 저장을 끈다
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY 환경변수가 필요합니다");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
