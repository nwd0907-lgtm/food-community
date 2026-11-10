"use client";

import { notFound } from "next/navigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { Toast } from "@/components/toast/Toast";
import { Text } from "@/components/typography/Text";
import { cn } from "@/lib/cn";
import { formatSchedule, PRODUCT_CANCEL_POLICY, PRODUCT_KIND, PRODUCT_TAGLINE } from "@/lib/product";
import { useProduct } from "@/lib/useProduct";
import { AppTopNavigation } from "../../_components/AppTopNavigation";
import { readingContainer } from "../../_components/layout";
import { PhotoGallery } from "../../restaurants/[id]/PhotoGallery";
import { ProductInfoList } from "../_components/ProductInfoList";
import { ProductPurchase } from "./ProductPurchase";

// 상세 조회 GET /api/products/[id]. 사진은 상세용 이미지(image_path_detail) 한 장
// "수업 참여하기" → design.pen 13 결제 바텀시트 (ProductPurchase)
export function ProductDetail({ id }: { id: string }) {
  const { product, status } = useProduct(id);

  if (status === "notFound") notFound();
  if (status === "failed")
    return (
      <>
        <AppTopNavigation
          title={PRODUCT_KIND}
          leftAction={{ label: "뒤로 가기", icon: "arrow-left", back: true, fallbackHref: "/" }}
          className="sticky top-0 z-10"
        />
        <Toast
          type="error"
          message="상품을 불러오지 못했어요. 새로고침해 주세요."
          className={cn(readingContainer, "mt-[var(--spacing-24)]")}
        />
      </>
    );
  if (!product) return <ProductDetailSkeleton />;

  return (
    <>
      <title>{product.name}</title>
      <AppTopNavigation
        title={PRODUCT_KIND}
        leftAction={{ label: "뒤로 가기", icon: "arrow-left", back: true, fallbackHref: "/" }}
        className="sticky top-0 z-10"
      />
      <main className="flex flex-1 flex-col md:pt-[var(--spacing-24)]">
        <div className="mx-auto w-full max-w-3xl md:px-[var(--spacing-24)]">
          <h2 className="sr-only">{product.name}</h2>
          <PhotoGallery name={product.name} photos={[{ src: product.detailImageUrl, alt: `${product.name} 사진` }]} />
        </div>
        <div className={cn(readingContainer, "flex flex-col gap-[var(--spacing-20)] pt-[var(--spacing-20)] pb-[var(--spacing-24)]")}>
          <section aria-label="소개" className="flex flex-col gap-[var(--spacing-8)]">
            <Text variant="label-md" as="p" className="text-[var(--color-text-brand)]">
              {PRODUCT_TAGLINE}
            </Text>
            <Text variant="body-md" className="whitespace-pre-line text-[var(--color-text-subtle)]">
              {product.description}
            </Text>
          </section>
          <section aria-labelledby="product-info-title" className="flex flex-col gap-[var(--spacing-12)]">
            <Text variant="heading-sm" as="h3" id="product-info-title">
              수업 정보
            </Text>
            <ProductInfoList
              items={[
                { label: "일시", value: formatSchedule(product.eventAt) },
                { label: "장소", value: product.address },
                { label: "취소", value: PRODUCT_CANCEL_POLICY },
              ]}
            />
          </section>
        </div>
      </main>
      <ProductPurchase
        productId={product.id}
        price={product.price}
        capacity={product.capacity}
        participants={product.participants}
      />
    </>
  );
}

export function ProductDetailSkeleton() {
  return (
    <>
      <div className="h-14 shadow-[inset_0_-1px_0_var(--color-border-default)]" />
      <div className="flex flex-col md:pt-[var(--spacing-24)]">
        <div className="mx-auto w-full max-w-3xl md:px-[var(--spacing-24)]">
          <Skeleton variant="rectangle" width="100%" height={480} className="rounded-none! md:rounded-xl!" />
        </div>
        <div className={cn(readingContainer, "flex flex-col gap-[var(--spacing-8)] pt-[var(--spacing-20)]")}>
          <Skeleton variant="text" typography="label-md" width={160} />
          <Skeleton variant="text" typography="body-md" />
          <Skeleton variant="text" typography="body-md" width="60%" />
        </div>
        <div className={cn(readingContainer, "flex flex-col gap-[var(--spacing-12)] pt-[var(--spacing-20)]")}>
          <Skeleton variant="text" typography="heading-sm" width={64} />
          <Skeleton variant="text" typography="body-md" />
          <Skeleton variant="text" typography="body-md" />
          <Skeleton variant="text" typography="body-md" />
        </div>
      </div>
    </>
  );
}
