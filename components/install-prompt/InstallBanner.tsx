import Image from "next/image";
import { cn } from "@/lib/cn";
import { Button } from "../button/Button";
import { IconButton } from "../icon-button/IconButton";
import { Text } from "../typography/Text";

// 앱 설치 유도 띠배너: 높이 64, 앱 아이콘 40 · 제목 label-lg · 설명 label-md(muted) · 설치 버튼(sm) · 닫기
// 띠 전체가 설치 버튼처럼 동작하고(탭 영역 확대), 키보드는 설치 버튼으로 접근한다
export type InstallBannerProps = {
  onInstall: () => void;
  onClose: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  iconSrc?: string;
  className?: string;
};

export function InstallBanner({
  onInstall,
  onClose,
  title = "FOOOD 앱 설치하기",
  description = "홈 화면에서 바로 동네 맛집을 열어보세요",
  actionLabel = "설치",
  iconSrc = "/icons/icon-192.png",
  className,
}: InstallBannerProps) {
  return (
    <div
      role="region"
      aria-label="앱 설치 안내"
      onClick={onInstall}
      className={cn(
        "flex h-16 cursor-pointer items-center gap-3 bg-[var(--color-background-surface)] pr-1 pl-4",
        "shadow-[inset_0_1px_0_var(--color-border-default)]",
        className,
      )}
    >
      <Image src={iconSrc} alt="" width={40} height={40} className="size-10 shrink-0 rounded-[10px]" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Text variant="label-lg" as="span" className="truncate">
          {title}
        </Text>
        <Text variant="label-md" as="span" className="truncate text-[var(--color-text-muted)]">
          {description}
        </Text>
      </div>
      <Button size="sm">{actionLabel}</Button>
      <IconButton
        label="설치 안내 닫기"
        icon="close"
        size="md"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      />
    </div>
  );
}
