-- 미적용: 원격 적용 후 이 줄을 "Supabase MCP apply_migration으로 원격에 적용됨 (version ...)"으로 바꾼다
-- 결제 원장 금액 부호: 결제(PAID) +, 취소(CANCELLED) −. transaction_key별 sum(amount) = 순결제액
-- 규칙 SSOT: .claude/rules/payment.md

-- 1) 금액 제약: 양수 고정 → type별 부호
alter table public.payment drop constraint payment_amount_positive;
alter table public.payment
  add constraint payment_amount_sign check (
    (type = 'PAID' and amount > 0) or (type = 'CANCELLED' and amount < 0)
  );

-- 2) record_payment: 부호 검증 + 취소는 같은 transaction_key의 PAID가 있고 전액(−PAID 금액)일 때만
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
  v_paid public.payment;
begin
  -- 같은 결제 건(transaction_key) 동시 기록 직렬화 (완료 페이지 · 웹훅 동시 도착)
  perform pg_advisory_xact_lock(hashtextextended(p_transaction_key::text, 0));

  -- 멱등: 같은 (transaction_key, type)이 있으면 기존 행
  select * into v_payment from public.payment where transaction_key = p_transaction_key and type = p_type;
  if found then
    return v_payment;
  end if;

  if p_type = 'CANCELLED' then
    select * into v_paid from public.payment where transaction_key = p_transaction_key and type = 'PAID';
    if not found then
      raise exception 'record_payment: CANCELLED without PAID (%)', p_transaction_key using errcode = '23514';
    end if;
    if p_amount <> -v_paid.amount or p_product_id <> v_paid.product_id or p_user_id <> v_paid.user_id then
      raise exception 'record_payment: CANCELLED must mirror PAID (%)', p_transaction_key using errcode = '23514';
    end if;
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
