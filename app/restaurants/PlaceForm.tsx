"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/button/Button";
import { FileUploader, type UploadFile } from "@/components/file-uploader/FileUploader";
import { Icon } from "@/components/icon/Icon";
import { TextField } from "@/components/text-field/TextField";
import { Textarea } from "@/components/textarea/Textarea";
import { Toast } from "@/components/toast/Toast";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import {
  CONTENT_MAX,
  IMAGES_MAX,
  PLACE_IMAGE_TYPES,
  TITLE_MAX,
  validateContent,
  validateImageCount,
  validateImageFile,
  validateLocation,
  validateTitle,
  type Place,
  type PlaceError,
  type PlaceLocation,
} from "@/lib/place";
import { formContainer } from "../_components/layout";
import { LocationPicker } from "./LocationPicker";

// design.pen 03 등록 · 오류 상태: 오류 토스트 · 사진 업로더(최대 5) · 가게 이름(30자) · 추천 이야기(10~300자) · 장소 등록하기 · 등록 버튼
// 장소 등록하기는 LocationPicker(09 장소 등록 · 10/11 장소 검색)를 열고, 고른 위치는 주소 행으로 보여 준다
// 등록 POST /api/places, 수정 PATCH /api/places/[id] (place가 있으면 수정 모드, 같은 화면 재사용)
// 오류는 입력을 마친(blur) 항목에만 표시하고, 하나라도 미완성이면 등록 버튼은 비활성
type Field = "images" | "title" | "content" | "location";

/** file이 있으면 새로 고른 사진(미리보기 object URL), 없으면 이미 저장된 사진(id = place_image.id) */
type Photo = UploadFile & { file?: File };

/** 파일아이템 상태 문구: "업로드 완료 · 순번 / 최대" */
const numbered = (photos: Photo[]) =>
  photos.map((photo, i) => ({ ...photo, statusText: `업로드 완료 · ${i + 1} / ${IMAGES_MAX}` }));

const revoke = (photo: Photo) => photo.file && photo.thumbnailUrl && URL.revokeObjectURL(photo.thumbnailUrl);

export function PlaceForm({ place }: { place?: Place }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(() =>
    numbered(
      (place?.images ?? []).map((image, i) => ({
        id: image.id,
        name: `${place!.title} 사진 ${i + 1}`,
        status: "complete",
        thumbnailUrl: image.url,
      })),
    ),
  );
  const [title, setTitle] = useState(place?.title ?? "");
  const [content, setContent] = useState(place?.content ?? "");
  const [location, setLocation] = useState<PlaceLocation | undefined>(place?.location ?? undefined);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    images: false,
    title: false,
    content: false,
    location: false,
  });
  const [photoError, setPhotoError] = useState<string>();
  const [serverError, setServerError] = useState<PlaceError>();
  const [saving, setSaving] = useState(false);
  const touch = (field: Field) => setTouched((prev) => ({ ...prev, [field]: true }));

  // 미리보기용 object URL은 언마운트 시 정리
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach(revoke), []);

  const errors: Record<Field, string | undefined> = {
    images: validateImageCount(photos.length),
    title: validateTitle(title),
    content: validateContent(content),
    location: validateLocation(location),
  };
  const visible = (field: Field) =>
    (field === "images" ? photoError : undefined) ??
    (touched[field] ? errors[field] : undefined) ??
    (serverError?.field === field ? serverError.message : undefined);
  const visibleCount = (["images", "title", "content", "location"] as const).filter((field) => visible(field)).length;
  const isValid = !errors.images && !errors.title && !errors.content && !errors.location;

  const addPhotos = (files: File[]) => {
    const rejected = files.find((file) => validateImageFile(file));
    const images = files.filter((file) => !validateImageFile(file)).slice(0, IMAGES_MAX - photos.length);
    setPhotoError(rejected && validateImageFile(rejected));
    setPhotos((prev) =>
      numbered([
        ...prev,
        ...images.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          status: "complete" as const,
          thumbnailUrl: URL.createObjectURL(file),
          file,
        })),
      ]),
    );
    touch("images");
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) revoke(target);
    setPhotos((prev) => numbered(prev.filter((photo) => photo.id !== id)));
    setPhotoError(undefined);
    touch("images");
  };

  /** 장소 검색에서 고른 상호명은 가게 이름이 비어 있을 때만 채운다 */
  const selectLocation = (next: PlaceLocation) => {
    setLocation(next);
    if (next.name && !title.trim()) setTitle(next.name.slice(0, TITLE_MAX));
    setPickingLocation(false);
    touch("location");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || saving) return;

    const body = new FormData();
    body.set("title", title.trim());
    body.set("content", content.trim());
    if (location) {
      body.set("address", location.address);
      body.set("latitude", String(location.latitude));
      body.set("longitude", String(location.longitude));
    }
    for (const photo of photos) {
      if (photo.file) body.append("images", photo.file);
      else body.append("keepImageIds", photo.id);
    }

    setSaving(true);
    setServerError(undefined);
    try {
      const response = await fetch(place ? `/api/places/${place.id}` : "/api/places", {
        method: place ? "PATCH" : "POST",
        body,
      });
      if (response.status === 401) return router.replace("/login");
      if (!response.ok) {
        setServerError(await response.json());
        return;
      }
      const saved: Place = await response.json();
      router.replace(`/restaurants/${saved.id}`);
      router.refresh();
    } catch {
      setServerError({ message: "저장하지 못했어요. 다시 시도해 주세요." });
    } finally {
      setSaving(false);
    }
  };

  const generalError = serverError && !serverError.field ? serverError.message : undefined;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={cn(
        formContainer,
        "flex flex-1 flex-col gap-[var(--spacing-24)] pt-[var(--spacing-16)] pb-[var(--spacing-32)]",
      )}
    >
      {generalError ? (
        <Toast type="error" message={generalError} />
      ) : (
        visibleCount > 0 && <Toast type="error" message={`빨간색으로 표시된 ${visibleCount}개 항목을 확인해 주세요.`} />
      )}

      <FileUploader
        accept={PLACE_IMAGE_TYPES.join(",")}
        multiple
        files={photos}
        disabled={saving}
        message={`사진을 끌어오거나 직접 선택하세요. (${photos.length}/${IMAGES_MAX})`}
        errorMessage={visible("images")}
        onFilesSelected={addPhotos}
        onRemove={removePhoto}
      />

      <TextField
        label="가게 이름"
        required
        size="lg"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={() => touch("title")}
        helperText={`${TITLE_MAX}자 이내로 입력해 주세요.`}
        errorMessage={visible("title")}
        trailingIcon={title ? "close" : undefined}
        trailingIconLabel="가게 이름 지우기"
        onTrailingIconClick={() => setTitle("")}
      />

      <Textarea
        label="추천 이야기"
        required
        value={content}
        maxLength={CONTENT_MAX}
        showCounter
        onChange={(event) => setContent(event.target.value)}
        onBlur={() => touch("content")}
        helperText="10자 이상, 추천 메뉴·주차·아이 동반 팁을 함께 적으면 좋아요."
        errorMessage={visible("content")}
      />

      <div className="flex flex-col gap-1.5">
        {location && (
          <div className="flex items-center gap-2">
            <Icon name="map-pin" size={20} className="text-[var(--color-text-brand)]" />
            <Text variant="body-md" className="min-w-0 flex-1">
              {location.address}
            </Text>
          </div>
        )}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          leadingIcon="map-pin"
          disabled={saving}
          aria-describedby={visible("location") ? "place-location-error" : undefined}
          onClick={() => setPickingLocation(true)}
        >
          {location ? "장소 변경하기" : "장소 등록하기"}
        </Button>
        {visible("location") && (
          <Text variant="label-md" id="place-location-error" className="text-[var(--color-text-error)]">
            {visible("location")}
          </Text>
        )}
      </div>

      {/* 폼 DOM 밖(body)에 그려서 검색창 Enter가 맛집 등록 폼을 제출하지 않게 한다 */}
      {pickingLocation &&
        createPortal(
          <LocationPicker
            value={location}
            onSelect={selectLocation}
            onClose={() => {
              setPickingLocation(false);
              touch("location");
            }}
          />,
          document.body,
        )}

      <Button type="submit" size="lg" fullWidth loading={saving} disabled={!isValid}>
        {place ? "수정하기" : "등록하기"}
      </Button>
    </form>
  );
}
