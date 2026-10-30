-- Supabase MCP apply_migration으로 원격에 적용됨 (version 20261027025243)

-- 한 번에 올린 사진은 created_at이 같아 순서가 정해지지 않는다. 첫 장(대표 사진)을 보장하려고 순번을 둔다
alter table public.place_image add column position smallint not null default 0;
drop index if exists public.place_image_place_id_idx;
create index place_image_place_id_position_idx on public.place_image (place_id, position);
