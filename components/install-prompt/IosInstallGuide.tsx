"use client";

import { BottomSheet } from "../bottom-sheet/BottomSheet";
import { Button } from "../button/Button";
import { Icon, type IconName } from "../icon/Icon";
import { Text } from "../typography/Text";

// iOS는 설치 API가 없어 Safari 공유 메뉴의 '홈 화면에 추가'를 직접 안내한다. 단계: 번호 원 24 · 본문 body-md · 아이콘 칩
const steps: { text: string; icon?: IconName; iconLabel?: string }[] = [
  { text: "브라우저의 공유 버튼을 눌러주세요", icon: "share-ios", iconLabel: "공유" },
  { text: "메뉴를 내려 '홈 화면에 추가'를 선택하세요", icon: "square-plus", iconLabel: "홈 화면에 추가" },
  { text: "오른쪽 위 '추가'를 누르면 완료돼요" },
];

export type IosInstallGuideProps = {
  open: boolean;
  onClose: () => void;
};

export function IosInstallGuide({ open, onClose }: IosInstallGuideProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="홈 화면에 FOOOD 추가하기"
      description="앱처럼 홈 화면에서 바로 열 수 있어요."
    >
      <ol className="flex flex-col gap-3 py-2">
        {steps.map((step, index) => (
          <li key={step.text} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]">
              <Text variant="label-md" as="span">
                {index + 1}
              </Text>
            </span>
            <Text variant="body-md" className="min-w-0 flex-1">
              {step.text}
            </Text>
            {step.icon && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-background-subtle)] text-[var(--color-text-info)]">
                <Icon name={step.icon} size={20} label={step.iconLabel} />
              </span>
            )}
          </li>
        ))}
      </ol>
      <Button fullWidth size="lg" onClick={onClose}>
        확인
      </Button>
    </BottomSheet>
  );
}
