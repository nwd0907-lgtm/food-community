"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/button/Button";

// BFF POST /api/auth/google → Google 동의 화면으로 이동 (페이지 전체 이동이라 form 제출 사용)
export function GoogleLoginButton() {
  const [pending, setPending] = useState(false);
  return (
    <form action="/api/auth/google" method="post" onSubmit={() => setPending(true)}>
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        fullWidth
        loading={pending}
        leadingIcon={<Image src="/images/google-g.svg" alt="" width={20} height={20} />}
      >
        Google로 계속하기
      </Button>
    </form>
  );
}
