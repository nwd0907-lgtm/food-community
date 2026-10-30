-- Supabase MCP apply_migration으로 원격에 적용됨 (version 20261027024004)

-- 제목 필수(30자 이내), 내용 필수·10자 이상(300자 이내). 앱과 같이 앞뒤 공백 제외 기준
alter table public.place
  add constraint place_title_required check (char_length(btrim(title)) between 1 and 30),
  add constraint place_content_min_length check (char_length(btrim(content)) between 10 and 300);

alter table public.place alter column user_id set default auth.uid();

create index if not exists place_user_id_idx on public.place (user_id);
create index if not exists place_created_at_idx on public.place (created_at desc);
create index if not exists place_image_place_id_idx on public.place_image (place_id);

-- place RLS: 로그인 사용자는 조회, 쓰기는 작성자 본인만
create policy "place_select_authenticated" on public.place
  for select to authenticated using (true);
create policy "place_insert_own" on public.place
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "place_update_own" on public.place
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "place_delete_own" on public.place
  for delete to authenticated using ((select auth.uid()) = user_id);

-- place_image RLS: 조회는 로그인 사용자, 추가·삭제는 부모 place 작성자만
create policy "place_image_select_authenticated" on public.place_image
  for select to authenticated using (true);
create policy "place_image_insert_own" on public.place_image
  for insert to authenticated with check (
    exists (select 1 from public.place p where p.id = place_id and p.user_id = (select auth.uid()))
  );
create policy "place_image_delete_own" on public.place_image
  for delete to authenticated using (
    exists (select 1 from public.place p where p.id = place_id and p.user_id = (select auth.uid()))
  );

-- place-image 버킷: 파일명은 <uuidv4>.<ext> (버킷 루트). 업로드는 로그인 사용자, 삭제는 올린 사람(owner_id)만
update storage.buckets
  set file_size_limit = 10485760, allowed_mime_types = array['image/png', 'image/jpeg']
  where id = 'place-image';

create policy "place_image_object_select_own" on storage.objects
  for select to authenticated using (bucket_id = 'place-image' and owner_id = (select auth.uid())::text);
create policy "place_image_object_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'place-image');
create policy "place_image_object_delete_own" on storage.objects
  for delete to authenticated using (bucket_id = 'place-image' and owner_id = (select auth.uid())::text);
