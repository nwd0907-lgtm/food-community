import "server-only";
import { NextResponse } from "next/server";
import type { PaymentError } from "@/lib/payment";
import { PAYMENT_TYPE } from "@/lib/payment";
import type { createClient } from "./server";

// 결제 BFF(app/api/payments/**) 공용
type Supabase = Awaited<ReturnType<typeof createClient>>;

export function fail(status: number, body: PaymentError) {
  return NextResponse.json(body, { status });
}

/** 내가 이 상품에 지금 참여 중인지 (결제 PAID 수 > 취소 CANCELLED 수). RLS로 내 행만 보인다 */
export async function hasActivePayment(supabase: Supabase, userId: string, productId: string) {
  const { data, error } = await supabase
    .from("payment")
    .select("type")
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw error;
  const paid = data.filter((row) => row.type === PAYMENT_TYPE.paid).length;
  const cancelled = data.filter((row) => row.type === PAYMENT_TYPE.cancelled).length;
  return paid > cancelled;
}
