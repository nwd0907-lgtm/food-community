"use client";

import Image from "next/image";
import Link from "next/link";
import { Empty } from "@/components/empty/Empty";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { Text } from "@/components/typography/Text";
import type { PaymentHistoryItem } from "@/lib/payment";
import { formatMonthDay, formatPrice, formatScheduleShort } from "@/lib/product";

// design.pen 15 마이페이지 · 결제 내역 / 16 취소 내역 목록. 데이터: BFF GET /api/payments (상품 정보는 결제 시점 스냅샷)
// 항목: 상태(heading-sm "결제 완료" · 취소는 error 색 "취소 완료") + 날짜(disabled) · 우측 "취소하기"(결제 내역만)
//       썸네일 75×100(라운드 2) + 상품명(14 semibold) · 일정 · 장소(muted) · 금액(heading-sm) · 참여 인원(muted)
// 참여자 아바타는 다른 사용자 결제가 RLS로 보이지 않아 인원 텍스트로 대신한다
// 항목 아래 20 뒤 8 띠(모바일은 화면 끝까지), 항목 사이 12. 1280 확장: md 2열 · lg 3열 (같은 줄 띠는 아래로 맞춘다)
export type PaymentHistoryProps = {
  kind: "paid" | "canceled";
  /** 받기 전에는 undefined (스켈레톤) */
  payments: PaymentHistoryItem[] | undefined;
  /** 불러오기 실패 */
  failed?: boolean;
  /** 결제 내역의 "취소하기" */
  onCancel?: (payment: PaymentHistoryItem) => void;
};

const LIST = "grid grid-cols-1 gap-y-[var(--spacing-12)] md:grid-cols-2 md:gap-x-[var(--spacing-24)] lg:grid-cols-3";

export function PaymentHistory({ kind, payments, failed, onCancel }: PaymentHistoryProps) {
  if (failed && !payments)
    return <Empty visual="calendar" title="결제 내역을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." />;

  if (!payments)
    return (
      <ul aria-busy className={LIST}>
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex flex-col gap-[var(--spacing-8)]">
            <Skeleton variant="text" typography="heading-sm" width={96} />
            <div className="flex gap-[var(--spacing-12)]">
              <Skeleton variant="rectangle" width={75} height={100} />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton variant="text" typography="heading-sm" width="80%" />
                <Skeleton variant="text" typography="body-md" width="60%" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    );

  if (payments.length === 0)
    return kind === "paid" ? (
      <Empty visual="calendar" title="아직 결제한 수업이 없어요" description="메인 배너에서 강연·모임을 둘러보세요." />
    ) : (
      <Empty visual="calendar" title="취소한 결제가 없어요" />
    );

  return (
    <ul className={LIST}>
      {payments.map(({ product, ...payment }) => (
        <li key={payment.paymentId} className="flex flex-col justify-between gap-[var(--spacing-20)]">
          <article aria-label={product.name} className="flex flex-col gap-[var(--spacing-8)]">
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
                  {formatMonthDay(kind === "paid" ? payment.paidAt : (payment.cancelledAt ?? payment.paidAt))}
                </Text>
              </div>
              {kind === "paid" && onCancel && (
                <button
                  type="button"
                  aria-label={`${product.name} 결제 취소하기`}
                  onClick={() => onCancel({ ...payment, product })}
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
                <Image src={product.thumbnailUrl} alt={`${product.name} 사진`} fill sizes="75px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-col gap-0.5">
                  <Text variant="heading-sm" as="h3" className="line-clamp-2 text-[length:var(--font-size-200)]">
                    {product.name}
                  </Text>
                  <div className="flex flex-col text-[var(--color-text-muted)]">
                    <Text variant="body-md">{formatScheduleShort(product.eventAt)}</Text>
                    <Text variant="body-md">{product.address}</Text>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-[var(--spacing-8)]">
                  <Text variant="heading-sm" as="p">
                    {formatPrice(payment.amount)}
                  </Text>
                  <Text variant="body-md" className="shrink-0 text-[var(--color-text-muted)]">
                    {`참여 ${product.participants}/${product.capacity}명`}
                  </Text>
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
