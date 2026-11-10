// 강연·모임 상품 BFF(/api/products) 응답 타입과 표시용 포맷. 클라이언트·서버 공용 (Supabase 의존 없음)
// design.pen 01 메인 배너 · 12 상품 상세 · 13 결제 바텀시트 · 14 결제 완료

export type Product = {
  id: string;
  name: string;
  /** 소개 문단. 줄바꿈은 그대로 보여 준다 */
  description: string;
  /** 시작 시각 (ISO 8601) */
  eventAt: string;
  address: string;
  price: number;
  capacity: number;
  /** 참여 인원: 결제(PAID) − 취소(CANCELLED), 사용자 단위 */
  participants: number;
  /** 메인 배너용 (문구까지 그려진 2:1 이미지) */
  bannerImageUrl: string;
  /** 상세 사진 갤러리용 */
  detailImageUrl: string;
};

/** 메인 상단 배너 한 장. positionClassName: 2:1보다 긴 이미지에서 보여 줄 위치 (Tailwind object-position) */
export type ProductBanner = { productId: string; image: { src: string; alt: string }; positionClassName?: string };

/** 404 · 500 응답 */
export type ProductError = { message: string };

/** 탑 내비 제목. 상품 종류가 강연·모임 하나뿐이라 고정 */
export const PRODUCT_KIND = "강연·모임";
/** 상세 제목 위 한 줄 문구 (시안 고정 문구) */
export const PRODUCT_TAGLINE = "소중한 하루! 나에게 투자하세요";
/** 취소 규칙 (PRD ⑦ 제안: 시작 전까지 전액 환불) */
export const PRODUCT_CANCEL_POLICY = "행사 시작 전까지 전액 환불";

export function toProductBanner(product: Product): ProductBanner {
  return { productId: product.id, image: { src: product.bannerImageUrl, alt: product.name } };
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 시각을 KST 기준 연·월·일·요일·시·분으로 나눈다 (서버 · 브라우저 시간대와 상관없이 같은 결과) */
function kstParts(iso: string) {
  const date = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: WEEKDAYS[date.getUTCDay()],
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

/** 상세 · 결제 완료 "2026. 11. 23 (월) 14:00" */
export function formatSchedule(iso: string) {
  const { year, month, day, weekday, hour, minute } = kstParts(iso);
  return `${year}. ${month}. ${pad(day)} (${weekday}) ${pad(hour)}:${pad(minute)}`;
}

/** 결제 내역 "2026. 11. 23(월) 오후 2시" */
export function formatScheduleShort(iso: string) {
  const { year, month, day, weekday, hour, minute } = kstParts(iso);
  const meridiem = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${year}. ${month}. ${pad(day)}(${weekday}) ${meridiem} ${hour12}시${minute ? ` ${minute}분` : ""}`;
}

/** 결제 내역 결제일 · 취소일 "11/20" */
export function formatMonthDay(iso: string) {
  const { month, day } = kstParts(iso);
  return `${month}/${pad(day)}`;
}

/** "30,000원" */
export function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}
