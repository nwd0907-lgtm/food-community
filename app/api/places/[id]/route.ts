import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fail,
  fetchPlace,
  getUserId,
  parsePlaceForm,
  removePlaceImages,
  sortImages,
  toPlace,
  uploadPlaceImages,
} from "@/lib/supabase/place";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/places/[id]: 상세 (사진 순번순, isMine)
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/places/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });
  if (!UUID.test(id)) return fail(404, { message: "맛집을 찾을 수 없어요." });

  const row = await fetchPlace(supabase, id);
  if (!row) return fail(404, { message: "맛집을 찾을 수 없어요." });
  return NextResponse.json(toPlace(row, userId));
}

// PATCH /api/places/[id] (multipart): title·content·위치 필수, keepImageIds(유지할 기존 사진) + images(새 사진) 합 1~5장. 작성자만
// 새 사진 업로드 → place 수정 → 새 place_image 추가 → 뺀 사진 행·파일 삭제
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/places/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });
  if (!UUID.test(id)) return fail(404, { message: "맛집을 찾을 수 없어요." });

  const current = await fetchPlace(supabase, id);
  if (!current) return fail(404, { message: "맛집을 찾을 수 없어요." });
  // RLS도 막지만, 작성자가 아니면 업로드 전에 거절한다
  if (current.user_id !== userId) return fail(403, { message: "내가 등록한 맛집만 수정할 수 있어요." });

  const form = await request.formData();
  const keepIds = new Set(form.getAll("keepImageIds").map(String));
  const images = sortImages(current.place_image);
  const kept = images.filter((image) => keepIds.has(image.id));
  const removed = images.filter((image) => !keepIds.has(image.id));

  const parsed = parsePlaceForm(form, kept.length);
  if (parsed.error) return fail(400, parsed.error);

  const paths = await uploadPlaceImages(supabase, parsed.files);
  if (!paths) return fail(500, { field: "images", message: "사진을 올리지 못했어요. 다시 시도해 주세요." });

  const { error } = await supabase
    .from("place")
    .update({
      title: parsed.title,
      content: parsed.content,
      address: parsed.address,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
    })
    .eq("id", id);
  if (error) {
    await removePlaceImages(supabase, paths);
    return fail(500, { message: "저장하지 못했어요. 다시 시도해 주세요." });
  }

  // 새 사진은 기존 사진 뒤에 붙인다
  const nextPosition = images.length ? images[images.length - 1].position + 1 : 0;
  if (paths.length) {
    const { error: imageError } = await supabase
      .from("place_image")
      .insert(paths.map((image_path, i) => ({ place_id: id, image_path, position: nextPosition + i })));
    if (imageError) {
      await removePlaceImages(supabase, paths);
      return fail(500, { field: "images", message: "사진을 저장하지 못했어요. 다시 시도해 주세요." });
    }
  }

  if (removed.length) {
    const { error: deleteError } = await supabase
      .from("place_image")
      .delete()
      .in(
        "id",
        removed.map((image) => image.id),
      );
    // 행 삭제가 실패하면 파일을 남겨 둔다 (깨진 이미지 방지)
    if (!deleteError) await removePlaceImages(supabase, removed.map((image) => image.image_path));
  }

  const row = await fetchPlace(supabase, id);
  if (!row) return fail(500, { message: "수정한 맛집을 불러오지 못했어요." });
  return NextResponse.json(toPlace(row, userId));
}

// DELETE /api/places/[id]: 소프트 삭제(deleted_at 기록). 작성자만, 사진 파일은 남겨 둔다
// soft_delete_place RPC가 작성자·미삭제 조건으로 갱신하고, 대상이 없으면 false
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/places/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });
  if (!UUID.test(id)) return fail(404, { message: "맛집을 찾을 수 없어요." });

  const current = await fetchPlace(supabase, id);
  if (!current) return fail(404, { message: "맛집을 찾을 수 없어요." });
  if (current.user_id !== userId) return fail(403, { message: "내가 등록한 맛집만 삭제할 수 있어요." });

  const { data: deleted, error } = await supabase.rpc("soft_delete_place", { p_place_id: id });
  if (error) return fail(500, { message: "삭제하지 못했어요. 다시 시도해 주세요." });
  // 그 사이 이미 삭제된 경우
  if (!deleted) return fail(404, { message: "맛집을 찾을 수 없어요." });

  return new NextResponse(null, { status: 204 });
}
