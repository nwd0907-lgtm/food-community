import "server-only";
import { NextResponse } from "next/server";
import {
  validateContent,
  validateImageCount,
  validateImageFile,
  validateLocation,
  validateTitle,
  type Place,
  type PlaceError,
} from "@/lib/place";
import type { createClient } from "./server";

// 맛집 BFF(app/api/places/**) 공용: 인증, 폼 검증, place-image 업로드, 응답 변환
export const PLACE_IMAGE_BUCKET = "place-image";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type PlaceRow = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  place_image: { id: string; image_path: string; position: number }[];
};

/** place + 사진(순번순) 조회용 select */
export const PLACE_SELECT = "id, title, content, user_id, address, latitude, longitude, place_image(id, image_path, position)";

export function fail(status: number, body: PlaceError) {
  return NextResponse.json(body, { status });
}

/** getClaims()로 JWT 서명을 검증한 사용자 id */
export async function getUserId(supabase: Supabase) {
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

/** 스토리지 공개 주소는 환경변수(SUPABASE_STORAGE_URL)로 분리하고, DB에는 버킷 안 파일 경로만 저장한다 */
export function placeImageUrl(path: string) {
  const base = process.env.SUPABASE_STORAGE_URL;
  if (!base) throw new Error("SUPABASE_STORAGE_URL 환경변수가 필요합니다");
  return `${base.replace(/\/$/, "")}/${PLACE_IMAGE_BUCKET}/${path}`;
}

/** 없거나 소프트 삭제됐거나 조회 실패면 null */
export async function fetchPlace(supabase: Supabase, id: string): Promise<PlaceRow | null> {
  const { data } = await supabase.from("place").select(PLACE_SELECT).eq("id", id).is("deleted_at", null).maybeSingle();
  return data;
}

export function sortImages(images: PlaceRow["place_image"]) {
  return [...images].sort((a, b) => a.position - b.position);
}

export function toPlace(row: PlaceRow, userId: string): Place {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    location:
      row.address != null && row.latitude != null && row.longitude != null
        ? { address: row.address, latitude: row.latitude, longitude: row.longitude }
        : null,
    images: sortImages(row.place_image).map((image) => ({ id: image.id, url: placeImageUrl(image.image_path) })),
    isMine: row.user_id === userId,
  };
}

/** multipart 공통 필드(title, content, address·latitude·longitude, images) 파싱·검증. existingCount는 수정 시 유지할 기존 사진 수 */
export function parsePlaceForm(form: FormData, existingCount = 0) {
  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const latitude = Number(form.get("latitude") ?? NaN);
  const longitude = Number(form.get("longitude") ?? NaN);
  const files = form.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

  const titleError = validateTitle(title);
  if (titleError) return { error: { field: "title", message: titleError } as PlaceError };
  const contentError = validateContent(content);
  if (contentError) return { error: { field: "content", message: contentError } as PlaceError };
  const locationError = validateLocation({
    address,
    latitude: Number.isNaN(latitude) ? undefined : latitude,
    longitude: Number.isNaN(longitude) ? undefined : longitude,
  });
  if (locationError) return { error: { field: "location", message: locationError } as PlaceError };
  const countError = validateImageCount(existingCount + files.length);
  if (countError) return { error: { field: "images", message: countError } as PlaceError };
  for (const file of files) {
    const fileError = validateImageFile(file);
    if (fileError) return { error: { field: "images", message: fileError } as PlaceError };
  }

  return { title, content, address, latitude, longitude, files };
}

/** place-image 버킷 루트에 <uuidv4>.<ext>로 올린다. 하나라도 실패하면 올린 것을 지우고 null */
export async function uploadPlaceImages(supabase: Supabase, files: File[]) {
  const paths = files.map((file) => `${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`);
  const results = await Promise.all(
    files.map((file, i) =>
      supabase.storage.from(PLACE_IMAGE_BUCKET).upload(paths[i], file, { contentType: file.type }),
    ),
  );
  if (results.every((result) => !result.error)) return paths;

  const uploaded = paths.filter((_, i) => !results[i].error);
  if (uploaded.length) await supabase.storage.from(PLACE_IMAGE_BUCKET).remove(uploaded);
  return null;
}

export async function removePlaceImages(supabase: Supabase, paths: string[]) {
  if (paths.length) await supabase.storage.from(PLACE_IMAGE_BUCKET).remove(paths);
}
