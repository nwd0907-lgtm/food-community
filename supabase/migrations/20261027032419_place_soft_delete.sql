-- Supabase MCP apply_migration으로 원격에 적용됨 (version 20261027032419)

-- 소프트 삭제: deleted_at이 있는 글은 조회·수정 대상에서 빠진다 (RLS로 DB에서 보장)
drop policy "place_select_authenticated" on public.place;
create policy "place_select_not_deleted" on public.place
  for select to authenticated using (deleted_at is null);

drop policy "place_update_own" on public.place;
create policy "place_update_own" on public.place
  for update to authenticated
  using ((select auth.uid()) = user_id and deleted_at is null)
  with check ((select auth.uid()) = user_id);

-- 삭제된 글의 사진 행도 조회되지 않게 한다
drop policy "place_image_select_authenticated" on public.place_image;
create policy "place_image_select_not_deleted" on public.place_image
  for select to authenticated using (
    exists (select 1 from public.place p where p.id = place_id and p.deleted_at is null)
  );

-- 하드 삭제는 막는다 (소프트 삭제만 허용)
drop policy "place_delete_own" on public.place;

-- 조회 정책이 deleted_at is null이라 일반 UPDATE로 deleted_at을 채우면 새 행이 SELECT 정책을 통과하지 못한다.
-- 작성자 본인 확인을 함수 안에서 하고 deleted_at만 채운다. 삭제했으면 true, 대상이 없거나 남의 글이면 false
create function public.soft_delete_place(p_place_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  update public.place
    set deleted_at = now()
    where id = p_place_id
      and user_id = (select auth.uid())
      and deleted_at is null;
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

revoke execute on function public.soft_delete_place(uuid) from public, anon;
grant execute on function public.soft_delete_place(uuid) to authenticated;

create index if not exists place_active_created_at_idx on public.place (created_at desc) where deleted_at is null;
