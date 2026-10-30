"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { TextField } from "@/components/text-field/TextField";
import { Toast } from "@/components/toast/Toast";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  DEFAULT_AVATAR,
  validateNickname,
  type Profile,
  type ProfileError,
} from "@/lib/profile";
import { saveProfileToCache, useProfile } from "@/lib/useProfile";
import { formContainer } from "../../_components/layout";

// design.pen 08 내 정보(프로필 설정): 아바타 72 + 카메라 변경 버튼 · 이메일 · 닉네임 입력 · 하단 저장하기
// 조회 GET /api/profile, 저장 PATCH /api/profile (multipart: nickname, image)
export function ProfileForm() {
  const { profile, failed } = useProfile();

  if (failed) return <Toast type="error" message="프로필을 불러오지 못했어요. 새로고침해 주세요." className={cn(formContainer, "mt-[var(--spacing-24)]")} />;
  // 불러오는 동안 아바타·이메일 자리 스켈레톤. 받은 뒤 키를 바꿔 입력값 초기화
  return profile ? <ProfileFields key={profile.nickname} profile={profile} /> : <ProfileFields />;
}

function ProfileFields({ profile }: { profile?: Profile }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [touched, setTouched] = useState(false);
  const [avatar, setAvatar] = useState<{ file: File; preview: string }>();
  const [serverError, setServerError] = useState<ProfileError>();
  const [saving, setSaving] = useState(false);

  useEffect(
    () => () => {
      if (avatar) URL.revokeObjectURL(avatar.preview);
    },
    [avatar],
  );

  const error = validateNickname(nickname);
  const nicknameError = (touched ? error : undefined) ?? (serverError?.field === "nickname" ? serverError.message : undefined);
  const imageError = serverError?.field === "image" ? serverError.message : undefined;
  const generalError = serverError && !serverError.field ? serverError.message : undefined;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (error || !profile) return;

    const body = new FormData();
    body.set("nickname", nickname.trim());
    if (avatar) body.set("image", avatar.file);

    setSaving(true);
    setServerError(undefined);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", body });
      if (response.status === 401) return router.replace("/login");
      if (!response.ok) {
        setServerError(await response.json());
        return;
      }
      saveProfileToCache(await response.json());
      router.push("/my");
    } catch {
      setServerError({ message: "저장하지 못했어요. 다시 시도해 주세요." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={cn(
        formContainer,
        "flex flex-1 flex-col justify-between gap-[var(--spacing-24)] pt-[var(--spacing-24)] pb-[var(--spacing-32)]",
        "md:flex-none md:justify-start md:gap-[var(--spacing-32)]",
      )}
    >
      <div className="flex flex-col gap-[var(--spacing-12)]">
        {generalError && <Toast type="error" message={generalError} />}

        <div className="flex flex-col items-center gap-[var(--spacing-12)]">
          <div className="relative size-[72px]">
            {profile ? (
              <Image
                src={avatar?.preview ?? profile.imageUrl ?? DEFAULT_AVATAR}
                alt="내 프로필 사진"
                fill
                sizes="72px"
                preload
                unoptimized={!!avatar}
                className="rounded-full object-cover"
              />
            ) : (
              <Skeleton variant="circle" size={72} />
            )}
            <label
              className={cn(
                "absolute right-0 bottom-0 flex size-6 cursor-pointer items-center justify-center rounded-full",
                "bg-[var(--color-background-strong)] text-[var(--color-text-on-strong)]",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-border-brand)]",
              )}
            >
              <Icon name="camera" size={16} label="프로필 사진 변경" />
              <input
                type="file"
                accept={AVATAR_TYPES.join(",")}
                className="sr-only"
                disabled={!profile}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!AVATAR_TYPES.includes(file.type) || file.size > AVATAR_MAX_BYTES) {
                    setServerError({ field: "image", message: "5MB 이하 PNG 또는 JPG 사진을 선택해 주세요." });
                    return;
                  }
                  setServerError(undefined);
                  setAvatar({ file, preview: URL.createObjectURL(file) });
                }}
              />
            </label>
          </div>
          {imageError && (
            <Text variant="label-md" as="p" role="alert" className="text-[var(--color-text-error)]">
              {imageError}
            </Text>
          )}
          {profile ? (
            <Text variant="label-md" as="p" className="text-[var(--color-text-muted)]">
              {profile.email}
            </Text>
          ) : (
            <Skeleton variant="text" typography="label-md" width={160} />
          )}
        </div>

        <TextField
          label="닉네임"
          size="lg"
          value={nickname}
          disabled={!profile}
          onChange={(event) => {
            setNickname(event.target.value);
            if (serverError?.field === "nickname") setServerError(undefined);
          }}
          onBlur={() => setTouched(true)}
          errorMessage={nicknameError}
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={saving} disabled={!profile}>
        저장하기
      </Button>
    </form>
  );
}
