// design.pen 화면(01 메인 · 02 상세 · 07 마이페이지 · 08 내 정보)에 쓰인 문구 그대로의 목업 데이터

export type Photo = { src: string; alt: string };

export type Restaurant = {
  id: string;
  name: string;
  /** 카드 한 줄 추천 */
  summary: string;
  photos: Photo[];
  /** 상세 본문 문단 (문단 안 줄바꿈은 \n) */
  story: string[];
  /** 내가 등록한 맛집 */
  mine?: boolean;
};

export const restaurants: Restaurant[] = [
  {
    id: "kenhome",
    name: "켄홈",
    summary: "모처럼 대부도에 놀러왔는데, 이런 골목이 있더라구요!",
    photos: [{ src: "/images/kenhome-1991.jpeg", alt: "켄홈 1991 간판이 걸린 골목 입구" }],
    story: [
      "모처럼 대부도에 놀러왔는데, 이런 골목이 있더라구요!\n바다만 보고 돌아가기 아쉬워서 천천히 걷다가 오래된 간판이 눈에 들어와 들어가 봤어요.\n입구부터 세월의 흔적이 느껴져서 궁금했는데, 안으로 들어가니 나무와 벽돌이 어우러진 분위기가 생각보다 훨씬 따뜻하고 아늑했어요.",
      "사진으로 봤을 때보다 안쪽 공간이 깊고 테이블 사이도 여유가 있어서 편하게 앉을 수 있었어요.\n메뉴는 직원분께 추천을 받아 여러 접시로 주문했는데, 재료 맛이 잘 느껴지고 전체적으로 자극적이지 않아서 좋았어요.\n음식도 천천히 나와서 여행 이야기 나누며 여유롭게 먹기 딱 좋았어요.",
      "대부도에서 이런 분위기의 공간을 만날 줄 몰라 더 기억에 남아요.\n저희가 방문한 주말 저녁에는 시간이 지나면서 자리가 금방 차서, 조용히 즐기고 싶다면 조금 일찍 가는 걸 추천해요.\n골목 안쪽이라 지나치기 쉬우니 오래된 켄홈 간판을 잘 찾아보세요.\n다음에 대부도에 오면 다시 들르고 싶어요.\n100점 만점에 90점 드립니다!",
    ],
    mine: true,
  },
  {
    id: "daebu-sky",
    name: "대부스카이",
    summary: "시원한 대부도의 느낌에 맞게, 바깥 공기와 함께 식사하기...",
    photos: [{ src: "/images/sky-riverside.jpg", alt: "대부스카이에서 바라본 물가 풍경" }],
    story: ["시원한 대부도의 느낌에 맞게, 바깥 공기와 함께 식사하기..."],
  },
  {
    id: "love-and-freedom",
    name: "사랑과자유",
    summary: "여행 마지막날, 무심코 들려본 커피숍이에요. 조금 더 일찍...",
    photos: [{ src: "/images/love.jpeg", alt: "사랑과 자유 간판이 걸린 커피숍 외관" }],
    story: ["여행 마지막날, 무심코 들려본 커피숍이에요. 조금 더 일찍..."],
    mine: true,
  },
];

export function getRestaurant(id: string) {
  return restaurants.find((restaurant) => restaurant.id === id);
}

export const currentUser = {
  nickname: "여행이조아",
  /** 08 내 정보 닉네임 입력 기본값 */
  profileNickname: "구로미식가",
  email: "nwd0907@gmail.com",
  avatar: { src: "/images/profile-avatar-p3g.png", alt: "내 프로필 사진" },
};

export type User = typeof currentUser;
