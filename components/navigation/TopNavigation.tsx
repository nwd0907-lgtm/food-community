import { cn } from "@/lib/cn";
import { IconButton, type IconButtonProps } from "../icon-button/IconButton";
import { Text } from "../typography/Text";

// design.pen navigation/top/default: 높이 56, 좌/우 아이콘 버튼(48, 아이콘 24) 추가·제외 가능, 제목 heading-sm 가운데
type NavAction = Pick<IconButtonProps, "label" | "icon" | "onClick">;

export type TopNavigationProps = {
  title: string;
  leftAction?: NavAction;
  rightActions?: NavAction[];
  className?: string;
  /** 아이콘·제목을 담는 안쪽 영역 클래스. 배경·구분선은 전체 폭으로 두고 내용만 서비스 영역 폭에 가둘 때 사용 */
  contentClassName?: string;
};

export function TopNavigation({ title, leftAction, rightActions = [], className, contentClassName }: TopNavigationProps) {
  // 제목이 항상 가운데 오도록 좌우 영역 폭을 같게 맞춘다
  const sideSlots = Math.max(leftAction ? 1 : 0, rightActions.length, 1);
  const sideWidth = { width: sideSlots * 48 };

  return (
    <header
      className={cn(
        "w-full bg-[var(--color-background-surface)] shadow-[inset_0_-1px_0_var(--color-border-default)]",
        className,
      )}
    >
      <div className={cn("flex h-14 w-full items-center px-3 py-1", contentClassName)}>
        <div className="flex shrink-0 items-center" style={sideWidth}>
          {leftAction && <IconButton {...leftAction} />}
        </div>
        <Text variant="heading-sm" as="h1" className="min-w-0 flex-1 truncate text-center">
          {title}
        </Text>
        <div className="flex shrink-0 items-center justify-end" style={sideWidth}>
          {rightActions.map((action) => (
            <IconButton key={action.label} {...action} />
          ))}
        </div>
      </div>
    </header>
  );
}
