import { NextResponse } from "next/server";
import { AVATAR_MAX_BYTES, AVATAR_TYPES, validateNickname, type Profile, type ProfileError } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "profile-image";

type Supabase = Awaited<ReturnType<typeof createClient>>;

function fail(status: number, body: ProfileError) {
  return NextResponse.json(body, { status });
}

// getClaims()로 JWT 서명을 검증한 사용자. Google 메타데이터는 프로필 행이 없을 때 기본값으로 쓴다
async function getUser(supabase: Supabase) {
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  const meta = (claims.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    id: claims.sub,
    email: claims.email ?? "",
    googleName: meta.full_name ?? meta.name ?? "",
    googleAvatar: meta.avatar_url ?? meta.picture ?? null,
  };
}

function toProfile(
  supabase: Supabase,
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  row: { nickname: string | null; image_path: string | null } | null,
): Profile {
  return {
    email: user.email,
    nickname: row?.nickname ?? user.googleName,
    imageUrl: row?.image_path
      ? supabase.storage.from(BUCKET).getPublicUrl(row.image_path).data.publicUrl
      : user.googleAvatar,
  };
}

// GET /api/profile: 내 프로필 (행이 없으면 Google 이름·사진)
export async function GET() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return fail(401, { message: "로그인이 필요해요." });

  const { data: row, error } = await supabase
    .from("profile")
    .select("nickname, image_path")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return fail(500, { message: "프로필을 불러오지 못했어요." });

  return NextResponse.json(toProfile(supabase, user, row));
}

// PATCH /api/profile (multipart): nickname 필수, image 선택. 새 사진은 <user_id>/<uuid>.<ext>로 올리고 이전 사진은 지운다
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return fail(401, { message: "로그인이 필요해요." });

  const form = await request.formData();
  const nickname = String(form.get("nickname") ?? "").trim();
  const nicknameError = validateNickname(nickname);
  if (nicknameError) return fail(400, { field: "nickname", message: nicknameError });

  const image = form.get("image");
  const file = image instanceof File && image.size > 0 ? image : null;
  if (file && !AVATAR_TYPES.includes(file.type))
    return fail(400, { field: "image", message: "PNG 또는 JPG 사진만 올릴 수 있어요." });
  if (file && file.size > AVATAR_MAX_BYTES)
    return fail(400, { field: "image", message: "사진은 5MB 이하로 올려 주세요." });

  const { data: prev } = await supabase.from("profile").select("image_path").eq("user_id", user.id).maybeSingle();

  let imagePath = prev?.image_path ?? null;
  if (file) {
    imagePath = `${user.id}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`;
    const { error } = await supabase.storage.from(BUCKET).upload(imagePath, file, { contentType: file.type });
    if (error) return fail(500, { field: "image", message: "사진을 올리지 못했어요. 다시 시도해 주세요." });
  }

  const { data: row, error } = await supabase
    .from("profile")
    .upsert({ user_id: user.id, nickname, image_path: imagePath }, { onConflict: "user_id" })
    .select("nickname, image_path")
    .single();

  if (error) {
    if (file && imagePath) await supabase.storage.from(BUCKET).remove([imagePath]);
    // 23505: profile_nickname_key 유니크 위반
    if (error.code === "23505") return fail(409, { field: "nickname", message: "이미 사용 중인 닉네임이에요." });
    return fail(500, { message: "저장하지 못했어요. 다시 시도해 주세요." });
  }

  if (file && prev?.image_path) await supabase.storage.from(BUCKET).remove([prev.image_path]);

  return NextResponse.json(toProfile(supabase, user, row));
}
