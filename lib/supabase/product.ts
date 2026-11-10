import "server-only";
import { NextResponse } from "next/server";
import type { Product, ProductError } from "@/lib/product";
import type { Database } from "./database.types";
import type { createClient } from "./server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// 상품 BFF(app/api/products/**) 공용: 조회 select, 이미지 주소 조립, 응답 변환
export const PRODUCT_IMAGE_BUCKET = "product-image";

/** 공개 상품만 노출 (RLS product_select_public과 같은 조건) */
export const PRODUCT_STATUS_PUBLIC = "Public";

export const PRODUCT_SELECT =
  "id, name, description, event_at, address, capacity, price, image_path_main, image_path_detail";

export type ProductRow = Pick<
  Database["public"]["Tables"]["product"]["Row"],
  "id" | "name" | "description" | "event_at" | "address" | "capacity" | "price" | "image_path_main" | "image_path_detail"
>;

export function fail(status: number, body: ProductError) {
  return NextResponse.json(body, { status });
}

/** 스토리지 공개 주소는 환경변수(SUPABASE_STORAGE_URL)로 분리하고, DB에는 버킷 안 파일 경로만 저장한다 */
export function productImageUrl(path: string) {
  const base = process.env.SUPABASE_STORAGE_URL;
  if (!base) throw new Error("SUPABASE_STORAGE_URL 환경변수가 필요합니다");
  return `${base.replace(/\/$/, "")}/${PRODUCT_IMAGE_BUCKET}/${path.replace(/^\//, "")}`;
}

/** 공개 상품 한 건. 없거나 비공개면 null, 조회 실패는 throw */
export async function fetchPublicProduct(supabase: Supabase, id: string) {
  const { data, error } = await supabase
    .from("product")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .eq("status", PRODUCT_STATUS_PUBLIC)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** 상품별 참여 인원 (결제 − 취소, 사용자 단위). product_participant_counts RPC */
export async function fetchParticipantCounts(supabase: Supabase, productIds: string[]) {
  const counts = new Map<string, number>();
  if (!productIds.length) return counts;
  const { data, error } = await supabase.rpc("product_participant_counts", { p_product_ids: productIds });
  if (error) throw error;
  for (const row of data ?? []) counts.set(row.product_id, row.participants);
  return counts;
}

export function toProduct(row: ProductRow, participants = 0): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    eventAt: row.event_at,
    address: row.address,
    // numeric 컬럼: 문자열로 올 수도 있어 숫자로 맞춘다
    price: Number(row.price),
    capacity: row.capacity,
    participants,
    bannerImageUrl: productImageUrl(row.image_path_main),
    detailImageUrl: productImageUrl(row.image_path_detail),
  };
}
