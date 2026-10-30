"use client";

import { notFound } from "next/navigation";
import { Spinner } from "@/components/spinner/Spinner";
import { Toast } from "@/components/toast/Toast";
import { cn } from "@/lib/cn";
import { usePlace } from "@/lib/usePlace";
import { formContainer } from "../../../_components/layout";
import { PlaceForm } from "../../PlaceForm";

// GET /api/places/[id]로 기존 값을 받아 폼을 채운다. 작성자가 아니면 폼 대신 안내 (저장은 BFF가 다시 확인)
export function EditPlace({ id }: { id: string }) {
  const { place, status } = usePlace(id);

  if (status === "notFound") notFound();
  if (status === "failed" || (place && !place.isMine))
    return (
      <Toast
        type="error"
        message={status === "failed" ? "맛집을 불러오지 못했어요. 새로고침해 주세요." : "내가 등록한 맛집만 수정할 수 있어요."}
        className={cn(formContainer, "mt-[var(--spacing-24)]")}
      />
    );
  if (!place)
    return (
      <div className="flex flex-1 items-center justify-center py-[var(--spacing-32)]">
        <Spinner label="맛집을 불러오는 중" />
      </div>
    );

  return <PlaceForm place={place} />;
}
