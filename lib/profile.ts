// 프로필 BFF(/api/profile) 응답 타입과 검증 규칙. 클라이언트·서버 공용 (Supabase 의존 없음)
export type Profile = {
  email: string;
  nickname: string;
  /** 없으면 기본 아바타 */
  imageUrl: string | null;
};

/** 400·409 응답: field가 있으면 해당 입력 아래에 표시 */
export type ProfileError = { field?: "nickname" | "image"; message: string };

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;
export const AVATAR_TYPES = ["image/png", "image/jpeg"];
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const DEFAULT_AVATAR = "/images/profile-avatar-p3g.png";

export function validateNickname(nickname: string) {
  const length = nickname.trim().length;
  return length < NICKNAME_MIN || length > NICKNAME_MAX ? `${NICKNAME_MIN}~${NICKNAME_MAX}자로 입력해 주세요.` : undefined;
}
