"use client";

import Image from "next/image";
import Link from "next/link";
import { Empty } from "@/components/empty/Empty";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { findPaymentProduct, type Payment, type PaymentProduct } from "@/lib/payment-mock";
import { formatMonthDay, formatPrice, formatScheduleShort } from "@/lib/product";

// design.pen 15 마이페이지 · 결제 내역 / 16 취소 내역 목록
// 항목: 상태(heading-sm "결제 완료" · 취소는 error 색 "취소 완료") + 날짜(disabled) · 우측 "취소하기"(결제 내역만)
//       썸네일 75×100(라운드 2) + 상품명(14 semibold) · 일정 · 장소(muted) · 금액(heading-sm) · 참여자 아바타 28(겹침 6, +N)
// 항목 아래 20 뒤 8 띠(모바일은 화면 끝까지), 항목 사이 12. 1280 확장: md 2열 · lg 3열 (같은 줄 띠는 아래로 맞춘다)
const VISIBLE_AVATARS = 3;

export type PaymentHistoryProps = {
  kind: "paid" | "canceled";
  payments: Payment[];
  /** 결제 내역의 "취소하기" */
  onCancel?: (payment: Payment, product: PaymentProduct) => void;
};

export function PaymentHistory({ kind, payments, onCancel }: PaymentHistoryProps) {
  const rows = payments.flatMap((payment) => {
    const product = findPaymentProduct(payment.productId);
    return product ? [{ payment, product }] : [];
  });

  if (rows.length === 0)
    return kind === "paid" ? (
      <Empty visual="calendar" title="아직 결제한 수업이 없어요" description="메인 배너에서 강연·모임을 둘러보세요." />
    ) : (
      <Empty visual="calendar" title="취소한 결제가 없어요" />
    );

  return (
    <ul className="grid grid-cols-1 gap-y-[var(--spacing-12)] md:grid-cols-2 md:gap-x-[var(--spacing-24)] lg:grid-cols-3">
      {rows.map(({ payment, product }) => (
        <li key={payment.id} className="flex flex-col justify-between gap-[var(--spacing-20)]">
          <article aria-label={product.title} className="flex flex-col gap-[var(--spacing-8)]">
            <div className="flex items-center justify-between gap-[var(--spacing-8)]">
              <div className="flex items-center gap-1">
                <Text
                  variant="heading-sm"
                  as="p"
                  className={kind === "canceled" ? "text-[var(--color-text-error)]" : undefined}
                >
                  {kind === "paid" ? "결제 완료" : "취소 완료"}
                </Text>
                <Text variant="body-md" as="span" className="text-[var(--color-text-disabled)]">
                  {formatMonthDay(kind === "paid" ? payment.paidAt : (payment.canceledAt ?? payment.paidAt))}
                </Text>
              </div>
              {kind === "paid" && onCancel && (
                <button
                  type="button"
                  aria-label={`${product.title} 결제 취소하기`}
                  onClick={() => onCancel(payment, product)}
                  className="-my-1 cursor-pointer rounded py-1 pl-2 text-[var(--color-text-disabled)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]"
                >
                  <Text variant="label-md">취소하기</Text>
                </button>
              )}
            </div>

            <Link
              href={`/products/${product.id}`}
              className="flex gap-[var(--spacing-12)] rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]"
            >
              <div className="relative h-[100px] w-[75px] shrink-0 overflow-hidden rounded-[2px] bg-[var(--color-background-subtle)]">
                <Image
                  src={product.thumbnail.src}
                  alt={product.thumbnail.alt}
                  fill
                  sizes="75px"
                  className={cn("object-cover", product.thumbnail.positionClassName)}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-col gap-0.5">
                  <Text variant="heading-sm" as="h3" className="line-clamp-2 text-[length:var(--font-size-200)]">
                    {product.title}
                  </Text>
                  <div className="flex flex-col text-[var(--color-text-muted)]">
                    <Text variant="body-md">{formatScheduleShort(product.startsAt)}</Text>
                    <Text variant="body-md">{product.place}</Text>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-[var(--spacing-8)]">
                  <Text variant="heading-sm" as="p">
                    {formatPrice(payment.amount)}
                  </Text>
                  <Participants avatars={product.participantAvatars} total={product.participants} />
                </div>
              </div>
            </Link>
          </article>
          <div
            aria-hidden
            className="-mx-[var(--spacing-16)] h-2 bg-[var(--color-background-subtle)] md:mx-0 md:rounded-sm"
          />
        </li>
      ))}
    </ul>
  );
}

function Participants({ avatars, total }: { avatars: string[]; total: number }) {
  const shown = avatars.slice(0, VISIBLE_AVATARS);
  const rest = total - shown.length;
  const ring = "size-7 rounded-full shadow-[0_0_0_1px_var(--color-background-default)]";
  return (
    <div role="img" aria-label={`참여자 ${total}명`} className="flex shrink-0 items-center -space-x-1.5">
      {shown.map((src) => (
        <Image key={src} src={src} alt="" width={28} height={28} className={cn(ring, "object-cover")} />
      ))}
      {rest > 0 && (
        <span className={cn(ring, "flex items-center justify-center bg-[var(--color-background-subtle)] text-[var(--color-text-muted)]")}>
          <Text variant="label-md">{`+${rest}`}</Text>
        </span>
      )}
    </div>
  );
}
