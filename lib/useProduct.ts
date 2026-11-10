"use client";

import { prefetchBff, readBff, useBff } from "./bff";
import type { Product } from "./product";

const LIST_URL = "/api/products";
const productUrl = (id: string) => `/api/products/${encodeURIComponent(id)}`;

/** GET /api/products (메인 배너) */
export function useProducts() {
  const { data, status } = useBff<Product[]>(LIST_URL);
  return { products: data, status };
}

/** 메인 화면 코드가 로드되는 즉시 배너 목록을 받기 시작한다 */
export function prefetchProducts() {
  prefetchBff(LIST_URL);
}

/** 배너 탭 · 호버 때 상세를 미리 받아 둔다 */
export function prefetchProduct(id: string) {
  prefetchBff(productUrl(id));
}

/** GET /api/products/[id]. 목록에서 온 경우 목록 항목(상세와 같은 내용)으로 먼저 그리고 뒤에서 갱신한다 */
export function useProduct(id: string) {
  const { data, status } = useBff<Product>(productUrl(id));
  const seed = data ?? readBff<Product[]>(LIST_URL)?.find((product) => product.id === id);
  return { product: seed, status: seed && status === "loading" ? ("ok" as const) : status };
}
