"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/card/Card";
import { Empty } from "@/components/empty/Empty";
import { IconButton } from "@/components/icon-button/IconButton";
import { Modal } from "@/components/modal/Modal";
import { TabNavigation } from "@/components/navigation/TabNavigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { Toast } from "@/components/toast/Toast";
import { Text } from "@/components/typography/Text";
import type { PlaceSummary } from "@/lib/place";
import { DEFAULT_AVATAR } from "@/lib/profile";
import { usePlaces } from "@/lib/usePlace";
import { useProfile } from "@/lib/useProfile";

// design.pen 07 마이페이지 · 내 기록: 프로필 요약(아바타 48 · 닉네임 · 이메일 · 로그아웃) · 탭(내 맛집 / 구매 내역 비활성) · 내 글 카드 그리드
// 프로필 요약은 BFF GET /api/profile, 내 글은 GET /api/places?mine=1
// 내 글 카드 우상단 X → 확인 모달 → DELETE /api/places/[id] (소프트 삭제) 후 목록에서 뺀다
export function MyPageContent() {
  const router = useRouter();
  const { profile } = useProfile();
  const { places, setPlaces } = usePlaces({ mine: true });
  const [deleting, setDeleting] = useState<PlaceSummary>();
  const [deleteError, setDeleteError] = useState<string>();

  const deletePlace = async () => {
    const target = deleting;
    if (!target) return;
    setDeleting(undefined);
    setDeleteError(undefined);
    try {
      const response = await fetch(`/api/places/${target.id}`, { method: "DELETE" });
      if (response.status === 401) return router.replace("/login");
      // 404: 이미 삭제된 글이므로 목록에서만 뺀다
      if (!response.ok && response.status !== 404) {
        const body: { message?: string } = await response.json().catch(() => ({}));
        setDeleteError(body.message ?? "삭제하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      setPlaces((prev) => prev?.filter((place) => place.id !== target.id));
    } catch {
      setDeleteError("삭제하지 못했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <>
      <section aria-label="내 프로필" className="flex h-12 items-center gap-[var(--spacing-8)]">
        {profile ? (
          <Image
            src={profile.imageUrl ?? DEFAULT_AVATAR}
            alt="내 프로필 사진"
            width={48}
            height={48}
            preload
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <Skeleton variant="circle" size={48} className="shrink-0" />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          {profile ? (
            <>
              <Text variant="heading-sm" as="h2" className="truncate">
                {profile.nickname}
              </Text>
              <Text variant="label-md" as="p" className="truncate text-[var(--color-text-muted)]">
                {profile.email}
              </Text>
            </>
          ) : (
            <>
              <Skeleton variant="text" typography="heading-sm" width={96} />
              <Skeleton variant="text" typography="label-md" width={160} />
            </>
          )}
        </div>
        <IconButton
          label="로그아웃"
          icon="logout"
          size="sm"
          className="mr-2 text-[var(--color-text-muted)]!"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.replace("/login");
            router.refresh();
          }}
        />
      </section>

      <TabNavigation
        label="마이페이지 탭"
        items={[
          { value: "mine", label: "내 맛집" },
          { value: "orders", label: "구매 내역", disabled: true },
        ]}
        defaultValue="mine"
      />

      {deleteError && <Toast type="error" message={deleteError} onClose={() => setDeleteError(undefined)} />}

      {places && places.length === 0 ? (
        <Empty visual="utensils" title="아직 등록한 맛집이 없어요" description="다녀온 숨은 맛집을 소개해 주세요." />
      ) : (
        <ul className="grid grid-cols-2 gap-x-[var(--spacing-12)] gap-y-[var(--spacing-20)] md:grid-cols-3 lg:grid-cols-4">
          {places
            ? places.map((place) => (
                <li key={place.id} className="relative">
                  <Link
                    href={`/restaurants/${place.id}`}
                    className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-border-brand)]"
                  >
                    <Card
                      size="sm"
                      title={place.title}
                      image={{ src: place.thumbnailUrl, alt: `${place.title} 대표 사진` }}
                      description={place.content}
                    />
                  </Link>
                  {/* 링크 밖 형제로 두어 카드 이동과 겹치지 않게 한다 */}
                  <IconButton
                    label={`${place.title} 삭제`}
                    icon="close"
                    variant="circle-neutral"
                    size="sm"
                    onClick={() => setDeleting(place)}
                    className="absolute top-[var(--spacing-8)] right-[var(--spacing-8)]"
                  />
                </li>
              ))
            : Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <Skeleton variant="rectangle" width="100%" height={112} />
                  <Skeleton variant="text" typography="heading-sm" width="60%" />
                </li>
              ))}
        </ul>
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        title="맛집을 삭제할까요?"
        secondaryAction={{ label: "취소", onClick: () => setDeleting(undefined) }}
        primaryAction={{ label: "삭제", onClick: deletePlace }}
      >
        {`‘${deleting?.title ?? ""}’ 글이 목록과 상세에서 사라져요.`}
      </Modal>
    </>
  );
}
