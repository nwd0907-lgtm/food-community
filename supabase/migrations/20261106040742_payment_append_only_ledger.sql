-- Supabase MCP apply_migration으로 원격에 적용됨 (version 20261106040742)
-- 결제 원장(payment)과 결제 스냅샷(payment_snaphost): append-only. 규칙 SSOT는 .claude/rules/payment.md

-- 1) 값 규칙: type은 PAID(결제) / CANCELLED(취소) 두 가지, 금액은 항상 양수(부호는 type으로 구분)
alter table public.payment
  add constraint payment_type_check check (type in ('PAID', 'CANCELLED')),
  add constraint payment_amount_positive check (amount > 0);

-- 같은 포트원 결제(transaction_key = paymentId)에 같은 종류의 행은 한 번만 (멱등)
create unique index payment_transaction_key_type_key on public.payment (transaction_key, type);
create index payment_user_id_created_at_idx on public.payment (user_id, created_at desc);
create index payment_product_id_idx on public.payment (product_id);
create index payment_payment_snapshot_id_idx on public.payment (payment_snapshot_id);

-- 2) 권한: 브라우저 역할(anon·authenticated)은 쓰기 불가. 쓰기는 BFF의 service_role(record_payment)만
revoke all on public.payment, public.payment_snaphost from anon, authenticated;
grant select on public.payment, public.payment_snaphost to authenticated;

create policy "payment_select_own" on public.payment
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "payment_snaphost_select_own" on public.payment_snaphost
  for select to authenticated using (
    exists (select 1 from public.payment p where p.payment_snapshot_id = payment_snaphost.id and p.user_id = (select auth.uid()))
  );

-- 3) append-only: 수정·삭제·비우기는 service_role 포함 누구도 못 한다
create or replace function public.forbid_payment_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception '%.% is append-only (% not allowed)', tg_table_schema, tg_table_name, tg_op using errcode = '42501';
end;
$$;

create trigger payment_append_only before update or delete on public.payment
  for each row execute function public.forbid_payment_mutation();
create trigger payment_append_only_truncate before truncate on public.payment
  for each statement execute function public.forbid_payment_mutation();
create trigger payment_snaphost_append_only before update or delete on public.payment_snaphost
  for each row execute function public.forbid_payment_mutation();
create trigger payment_snaphost_append_only_truncate before truncate on public.payment_snaphost
  for each statement execute function public.forbid_payment_mutation();

-- 4) 기록: 스냅샷 + 원장 행을 한 트랜잭션으로. 같은 (transaction_key, type)이면 기존 행을 돌려준다 (멱등)
create or replace function public.record_payment(
  p_transaction_key uuid,
  p_type text,
  p_amount numeric,
  p_product_id uuid,
  p_user_id uuid,
  p_snapshot_payment jsonb,
  p_snapshot_product jsonb
) returns public.payment
language plpgsql security invoker set search_path = '' as $$
declare
  v_snapshot_id uuid;
  v_payment public.payment;
begin
  -- 같은 결제 건 동시 기록 직렬화
  perform pg_advisory_xact_lock(hashtextextended(p_transaction_key::text || ':' || p_type, 0));

  select * into v_payment from public.payment where transaction_key = p_transaction_key and type = p_type;
  if found then
    return v_payment;
  end if;

  insert into public.payment_snaphost (snapshot_payment, snapshot_product)
  values (p_snapshot_payment, p_snapshot_product)
  returning id into v_snapshot_id;

  insert into public.payment (transaction_key, type, amount, product_id, user_id, payment_snapshot_id)
  values (p_transaction_key, p_type, p_amount, p_product_id, p_user_id, v_snapshot_id)
  returning * into v_payment;

  return v_payment;
end;
$$;
revoke all on function public.record_payment(uuid, text, numeric, uuid, uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.record_payment(uuid, text, numeric, uuid, uuid, jsonb, jsonb) to service_role;

-- 5) 참여 인원: 상품별로 결제(PAID) 수가 취소(CANCELLED) 수보다 많은 사용자 수. 다른 사람 결제 행은 RLS로 못 보므로 definer로 숫자만 연다
create or replace function public.product_participant_counts(p_product_ids uuid[])
returns table (product_id uuid, participants integer)
language sql stable security definer set search_path = '' as $$
  select t.product_id, count(*)::integer
  from (
    select p.product_id, p.user_id
    from public.payment p
    where p.product_id = any (p_product_ids)
    group by p.product_id, p.user_id
    having count(*) filter (where p.type = 'PAID') > count(*) filter (where p.type = 'CANCELLED')
  ) t
  group by t.product_id;
$$;
revoke all on function public.product_participant_counts(uuid[]) from public, anon;
grant execute on function public.product_participant_counts(uuid[]) to authenticated, service_role;
