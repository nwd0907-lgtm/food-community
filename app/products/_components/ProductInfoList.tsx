import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";

// design.pen 12 상품 상세 "수업 정보" · 14 결제 완료 "결제 정보" 행: "· 라벨"(label-md semibold, 64) + 값(body-md), 행 간격 12
// emphasis: 결제 금액처럼 값을 16 semibold 브랜드 색으로 강조
export type ProductInfoItem = { label: string; value: string; emphasis?: boolean };

export function ProductInfoList({ items, className }: { items: ProductInfoItem[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col gap-[var(--spacing-12)]", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex gap-[var(--spacing-12)]">
          <Text
            variant="label-md"
            as="dt"
            className="w-16 shrink-0 font-[number:var(--font-weight-semibold)] text-[var(--color-text-muted)]"
          >
            {`· ${item.label}`}
          </Text>
          <Text
            variant={item.emphasis ? "heading-sm" : "body-md"}
            as="dd"
            className={cn("min-w-0 flex-1", item.emphasis && "text-[var(--color-text-brand)]")}
          >
            {item.value}
          </Text>
        </div>
      ))}
    </dl>
  );
}
