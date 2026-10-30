"use client";

import { useEffect, useState } from "react";
import type { Profile } from "./profile";

// BFF GET /api/profile. 401이면 로그인 페이지로 보낸다
export function useProfile() {
  const [profile, setProfile] = useState<Profile>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then(async (response) => {
        if (response.status === 401) {
          window.location.replace("/login");
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        const data: Profile = await response.json();
        if (active) setProfile(data);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  return { profile, setProfile, failed };
}
