import { NextResponse } from "next/server";
import { PAYMENT_TYPE, type PaymentHistoryItem } from "@/lib/payment";
import { fail } from "@/lib/supabase/payment";
import { getUserId } from "@/lib/supabase/place";
import { fetchParticipantCounts, productImageUrl } from "@/lib/supabase/product";
import { createClient } from "@/lib/supabase/server";

// GET /api/payments: 내 결제 내역 (.claude/rules/payment.md § 화면·캐시)
// 로그인 사용자 클라이언트로 조회 → RLS로 본인 원장 · 본인 스냅샷만 보인다 (service_role 쓰지 않음)
// transaction_key로 묶어 PAID + CANCELLED를 한 건으로 만들고, 상품 정보는 결제 시점 스냅샷(snapshot_product)으로 보여 준다
type SnapshotProduct = { name?: string; event_at?: string; address?: string; image_path_detail?: string; capacity?: number };
type SnapshotPayment = { paidAt?: string; cancelledAt?: string };

export async function GET() {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });

  const { data: rows, error } = await supabase
    .from("payment")
    .select("transaction_key, type, amount, product_id, created_at, payment_snaphost(snapshot_payment, snapshot_product)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return fail(500, { message: "결제 내역을 불러오지 못했어요." });

  const paid = rows.filter((row) => row.type === PAYMENT_TYPE.paid);
  const cancelled = new Map(
    rows.filter((row) => row.type === PAYMENT_TYPE.cancelled).map((row) => [row.transaction_key, row]),
  );

  try {
    const counts = await fetchParticipantCounts(supabase, [...new Set(paid.map((row) => row.product_id))]);
    const items = paid.flatMap((row): PaymentHistoryItem[] => {
      const product = (row.payment_snaphost?.snapshot_product ?? {}) as SnapshotProduct;
      if (!product.name || !product.event_at || !product.image_path_detail) return [];
      const cancel = cancelled.get(row.transaction_key);
      const paidSnapshot = row.payment_snaphost?.snapshot_payment as SnapshotPayment | undefined;
      const cancelSnapshot = cancel?.payment_snaphost?.snapshot_payment as SnapshotPayment | undefined;
      return [
        {
          paymentId: row.transaction_key,
          status: cancel ? PAYMENT_TYPE.cancelled : PAYMENT_TYPE.paid,
          amount: Math.abs(Number(row.amount)),
          paidAt: paidSnapshot?.paidAt ?? row.created_at,
          cancelledAt: cancel ? (cancelSnapshot?.cancelledAt ?? cancel.created_at) : null,
          product: {
            id: row.product_id,
            name: product.name,
            eventAt: product.event_at,
            address: product.address ?? "",
            thumbnailUrl: productImageUrl(product.image_path_detail),
            capacity: product.capacity ?? 0,
            participants: counts.get(row.product_id) ?? 0,
          },
        },
      ];
    });
    return NextResponse.json(items);
  } catch {
    return fail(500, { message: "결제 내역을 불러오지 못했어요." });
  }
}
