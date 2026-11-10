import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

// design.pen 상품 배너 / 강연·모임: 문구까지 그려진 배너 이미지 한 장(2:1, cover), 라운드 16. 누르면 상품 상세로 이동
// 메인 상단처럼 화면 끝까지 붙일 때는 rounded={false} (design.pen 01 메인 인스턴스 cornerRadius 0)
export type ProductBannerProps = {
  href: string;
  /** alt는 배너 이미지에 적힌 문구를 그대로 */
  image: { src: string; alt: string; preload?: boolean; sizes?: string };
  /** 이미지 위치 (Tailwind object-position, 기본 가운데) */
  imageClassName?: string;
  rounded?: boolean;
  className?: string;
};

export function ProductBanner({ href, image, imageClassName, rounded = true, className }: ProductBannerProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative block aspect-[2/1] w-full overflow-hidden bg-[var(--color-background-subtle)]",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
        rounded && "rounded-2xl",
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        preload={image.preload}
        sizes={image.sizes ?? "(max-width: 768px) 100vw, 400px"}
        className={cn("object-cover", imageClassName)}
      />
    </Link>
  );
}
