import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "../button/Button";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// design.pen empty/default: 가로·세로 중앙 정렬. 설명의 줄바꿈(\n)은 그대로 표시. 비주얼(아이콘/그림) · 제목 heading-sm · 설명 body-md · 액션(secondary + primary) 추가·제외 가능
type EmptyAction = { label: string; onClick?: () => void; icon?: IconName };

export type EmptyProps = {
  title: string;
  description?: string;
  /** 아이콘 이름이면 64 원형 영역 안에 32 아이콘, ReactNode면 그대로 렌더 */
  visual?: IconName | ReactNode;
  primaryAction?: EmptyAction;
  secondaryAction?: EmptyAction;
  className?: string;
};

export function Empty({ title, description, visual, primaryAction, secondaryAction, className }: EmptyProps) {
  return (
    <section
      className={cn("flex w-full flex-col items-center justify-center gap-4 px-12 py-10 text-center", className)}
    >
      {typeof visual === "string" ? (
        <span className="flex size-16 items-center justify-center rounded-full text-[var(--color-text-muted)] shadow-[inset_0_0_0_1px_var(--color-border-default)]">
          <Icon name={visual as IconName} size={32} />
        </span>
      ) : (
        visual
      )}
      <Text variant="heading-sm" as="h2" className="w-full">
        {title}
      </Text>
      {description && (
        <Text variant="body-md" className="w-full whitespace-pre-line text-[var(--color-text-muted)]">
          {description}
        </Text>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center justify-center gap-2">
          {secondaryAction && (
            <Button variant="secondary" leadingIcon={secondaryAction.icon} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button leadingIcon={primaryAction.icon} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
