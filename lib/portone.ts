import "server-only";
import { PaymentClient } from "@portone/server-sdk";

// PortOne V2 서버 클라이언트 (결제 단건 조회로 검증). API Secret은 서버 전용 (.claude/rules/payment.md)
export function portoneConfig() {
  const secret = process.env.PORTONE_API_SECRET;
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
  if (!secret || !storeId || !channelKey)
    throw new Error("PORTONE_API_SECRET / NEXT_PUBLIC_PORTONE_STORE_ID / NEXT_PUBLIC_PORTONE_CHANNEL_KEY 환경변수가 필요합니다");
  return { secret, storeId, channelKey };
}

export function createPortOnePaymentClient() {
  const { secret, storeId } = portoneConfig();
  return PaymentClient({ secret, storeId });
}
