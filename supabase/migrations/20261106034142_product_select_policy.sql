-- Supabase MCP apply_migration으로 원격에 적용됨 (version 20261106034142)

-- product RLS: 로그인 사용자는 공개(status = 'Public') 상품만 조회. 등록·수정은 대시보드(관리자)에서만
create policy "product_select_public" on public.product
  for select to authenticated using (status = 'Public');

create index if not exists product_event_at_idx on public.product (event_at);
