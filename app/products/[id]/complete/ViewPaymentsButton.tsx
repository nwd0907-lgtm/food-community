"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/button/Button";

const PAYMENTS_HREF = "/my?tab=payments";

/** 결제 완료 → 마이페이지 결제 내역 탭. 완료 화면은 히스토리에서 바꿔 끼워, 뒤로 가기로 다시 오지 않게 한다 */
export function ViewPaymentsButton() {
  const router = useRouter();
  useEffect(() => router.prefetch(PAYMENTS_HREF), [router]);
  return (
    <Button size="lg" fullWidth onClick={() => router.replace(PAYMENTS_HREF)}>
      결제 내역 보기
    </Button>
  );
}
