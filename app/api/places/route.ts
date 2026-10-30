import { NextResponse, type NextRequest } from "next/server";
import type { PlaceSummary } from "@/lib/place";
import { createClient } from "@/lib/supabase/server";
import {
  fail,
  fetchPlace,
  getUserId,
  parsePlaceForm,
  PLACE_SELECT,
  removePlaceImages,
  toPlace,
  uploadPlaceImages,
} from "@/lib/supabase/place";

// GET /api/places: 최신순 목록(소프트 삭제 제외). ?mine=1이면 내가 등록한 맛집만
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });

  let query = supabase
    .from("place")
    .select(PLACE_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (request.nextUrl.searchParams.get("mine") === "1") query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) return fail(500, { message: "맛집을 불러오지 못했어요." });

  // 상세와 같은 내용을 담아, 목록에서 상세로 갈 때 클라이언트가 다시 기다리지 않게 한다
  const places: PlaceSummary[] = data.flatMap((row) => {
    const place = toPlace(row, userId);
    // 사진 없는 글은 만들 수 없지만, 정합성이 깨진 행은 카드에서 제외한다
    return place.images[0] ? [{ ...place, thumbnailUrl: place.images[0].url }] : [];
  });
  return NextResponse.json(places);
}

// POST /api/places (multipart): title·content·위치(address·latitude·longitude) 필수, images 1~5장. 사진을 먼저 올리고 place → place_image 순으로 저장
export async function POST(request: Request) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return fail(401, { message: "로그인이 필요해요." });

  const parsed = parsePlaceForm(await request.formData());
  if (parsed.error) return fail(400, parsed.error);

  const paths = await uploadPlaceImages(supabase, parsed.files);
  if (!paths) return fail(500, { field: "images", message: "사진을 올리지 못했어요. 다시 시도해 주세요." });

  const { data: place, error } = await supabase
    .from("place")
    .insert({
      user_id: userId,
      title: parsed.title,
      content: parsed.content,
      address: parsed.address,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
    })
    .select("id")
    .single();
  if (error) {
    await removePlaceImages(supabase, paths);
    return fail(500, { message: "등록하지 못했어요. 다시 시도해 주세요." });
  }

  const { error: imageError } = await supabase
    .from("place_image")
    .insert(paths.map((image_path, position) => ({ place_id: place.id, image_path, position })));
  if (imageError) {
    // place_image는 place 삭제 시 cascade
    await supabase.from("place").delete().eq("id", place.id);
    await removePlaceImages(supabase, paths);
    return fail(500, { message: "등록하지 못했어요. 다시 시도해 주세요." });
  }

  const row = await fetchPlace(supabase, place.id);
  if (!row) return fail(500, { message: "등록한 맛집을 불러오지 못했어요." });
  return NextResponse.json(toPlace(row, userId), { status: 201 });
}
