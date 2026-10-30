"use client";

import { useBff, writeBff } from "./bff";
import type { Profile } from "./profile";

const PROFILE_URL = "/api/profile";

// BFF GET /api/profile. 401이면 로그인 페이지로 보낸다 (lib/bff)
export function useProfile() {
  const { data, status } = useBff<Profile>(PROFILE_URL);
  return { profile: data, failed: status === "failed" };
}

/** 저장한 프로필을 캐시에 반영해 마이페이지가 바로 새 값으로 보이게 한다 */
export function saveProfileToCache(profile: Profile) {
  writeBff(PROFILE_URL, profile);
}
