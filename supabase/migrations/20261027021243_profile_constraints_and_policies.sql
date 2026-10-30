-- Supabase MCP apply_migration으로 원격에 적용됨 (version 20261027021243)

-- 사용자당 프로필 1개, 닉네임 중복 불가(PRD ② 마이 페이지), 2~12자
alter table public.profile
  add constraint profile_user_id_key unique (user_id),
  add constraint profile_nickname_key unique (nickname),
  add constraint profile_nickname_length check (nickname is null or char_length(nickname) between 2 and 12);

alter table public.profile alter column user_id set default auth.uid();

-- profile RLS: 로그인 사용자는 조회 가능(작성자 표시용), 쓰기는 본인 행만
create policy "profile_select_authenticated" on public.profile
  for select to authenticated using (true);
create policy "profile_insert_own" on public.profile
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profile_update_own" on public.profile
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- profile-image 버킷: 본인 폴더(<user_id>/...)에만 업로드·삭제. 공개 버킷이라 읽기는 public URL
update storage.buckets
  set file_size_limit = 5242880, allowed_mime_types = array['image/png', 'image/jpeg']
  where id = 'profile-image';

create policy "profile_image_select_own" on storage.objects
  for select to authenticated using (bucket_id = 'profile-image' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile_image_insert_own" on storage.objects
  for insert to authenticated with check (bucket_id = 'profile-image' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile_image_delete_own" on storage.objects
  for delete to authenticated using (bucket_id = 'profile-image' and (storage.foldername(name))[1] = (select auth.uid())::text);
