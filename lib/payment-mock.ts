// 결제 내역 목업 (design.pen 15/16 마이페이지). 결제 테이블 · PG가 붙기 전까지 화면 확인용으로만 쓴다
// 상품 목록 · 상세는 BFF(GET /api/products, /api/products/[id])로 옮겼고, 여기 상품은 결제 내역 카드 그리기용 목업이다
// TODO(결제 연동): 결제 내역은 GET /api/payments(상품 정보 포함)로 바꾸고 이 파일을 지운다

export type ProductPhoto = { src: string; alt: string };

export type PaymentProduct = {
  id: string;
  /** 탑 내비 제목 */
  kind: string;
  title: string;
  /** 제목 위 한 줄 문구 (브랜드 색) */
  tagline: string;
  /** 소개 문단. 문단 사이는 빈 줄 */
  description: string;
  photos: ProductPhoto[];
  /** 마이페이지 결제 내역 썸네일(75×100). positionClassName: 가로로 긴 이미지에서 보여 줄 위치 (Tailwind object-position) */
  thumbnail: ProductPhoto & { positionClassName: string };
  /** 시작 시각 (KST, ISO 8601) */
  startsAt: string;
  place: string;
  cancelPolicy: string;
  price: number;
  capacity: number;
  participants: number;
  /** 결제 내역에 겹쳐 보이는 참여자 사진 (최대 3명, 나머지는 +N) */
  participantAvatars: string[];
};

const AVATAR_ME = "/images/profile-avatar-p3g.png";

export const paymentProducts: PaymentProduct[] = [
  {
    id: "cooking-class",
    kind: "강연·모임",
    title: "칼질 몰라도 괜찮아, 누구나 할 수 있는 원데이 요리교실",
    tagline: "소중한 하루! 나에게 투자하세요",
    description:
      "칼을 처음 잡는 분도 천천히 따라올 수 있어요. 안전한 칼 사용법과 기본 재료 손질부터 차근차근 알려드려요.\n\n제철 재료로 메인 요리와 곁들임을 함께 만들어요. 재료별 손질법부터 불 조절, 간 맞추기, 플레이팅까지 직접 경험해요.\n\n완성한 요리는 함께 맛보며 조리 포인트를 정리해요. 수업 후에는 집에서도 다시 만들 수 있도록 핵심 레시피를 제공해 드려요.",
    photos: [
      { src: "/images/products/cooking-class-main.jpeg", alt: "철판에 볶은 매콤한 쭈꾸미 요리" },
      { src: "/images/products/cooking-class-detail.jpg", alt: "수업에서 함께 만든 요리 한 상" },
    ],
    thumbnail: {
      src: "/images/products/cooking-class-thumbnail.png",
      alt: "원데이 요리교실 썸네일",
      positionClassName: "object-[87%_50%]",
    },
    startsAt: "2026-11-23T14:00:00+09:00",
    place: "구로생활문화센터 2층",
    cancelPolicy: "행사 시작 전까지 전액 환불",
    price: 30000,
    capacity: 30,
    participants: 12,
    participantAvatars: ["/images/participants/face-01.jpg", "/images/participants/face-02.jpg", AVATAR_ME],
  },
  {
    id: "sourdough-class",
    kind: "강연·모임",
    title: "처음 만드는 사워도우, 천연발효빵 원데이 클래스",
    tagline: "소중한 하루! 나에게 투자하세요",
    description: "천연 발효종을 다루는 법부터 반죽, 성형, 굽기까지 하루 동안 함께 경험해요.",
    photos: [{ src: "/images/products/sourdough-class-thumbnail.png", alt: "대리석 위에 놓인 베이킹 도구" }],
    thumbnail: {
      src: "/images/products/sourdough-class-thumbnail.png",
      alt: "사워도우 원데이 클래스 썸네일",
      positionClassName: "object-right",
    },
    startsAt: "2026-12-07T19:00:00+09:00",
    place: "성수 베이킹 스튜디오",
    cancelPolicy: "행사 시작 전까지 전액 환불",
    price: 30000,
    capacity: 20,
    participants: 10,
    participantAvatars: ["/images/participants/face-03.jpg", "/images/participants/face-04.jpg", AVATAR_ME],
  },
];

export function findPaymentProduct(id: string) {
  return paymentProducts.find((product) => product.id === id);
}

export type PaymentStatus = "paid" | "canceled";

export type Payment = {
  id: string;
  productId: string;
  amount: number;
  status: PaymentStatus;
  /** 결제일 (KST, ISO 8601) */
  paidAt: string;
  canceledAt?: string;
};

/** 마이페이지 결제 내역 · 취소 내역 목업 (design.pen 15 · 16) */
export const samplePayments: Payment[] = [
  { id: "pay-1", productId: "cooking-class", amount: 30000, status: "paid", paidAt: "2026-11-20T10:12:00+09:00" },
  { id: "pay-2", productId: "sourdough-class", amount: 30000, status: "paid", paidAt: "2026-12-04T21:40:00+09:00" },
];

