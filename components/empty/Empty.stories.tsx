import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Icon } from "../icon/Icon";
import { Empty } from "./Empty";

// design.pen empty/default
const meta = {
  title: "Components/Etc/Empty",
  component: Empty,
  args: {
    visual: "image",
    title: "아직 등록된 맛집이 없어요",
    description: "첫 번째 동네 맛집을 등록하고 이웃과 이야기를 나눠보세요.",
    secondaryAction: { label: "새로고침", icon: "refresh", onClick: fn() },
    primaryAction: { label: "맛집 등록", icon: "plus", onClick: fn() },
  },
  decorators: [(Story) => <div className="w-[400px]"><Story /></div>],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "맛집 등록" }));
    await expect(args.primaryAction?.onClick).toHaveBeenCalled();
  },
};

export const TitleOnly: Story = {
  args: { visual: undefined, description: undefined, primaryAction: undefined, secondaryAction: undefined },
};

export const PrimaryOnly: Story = { args: { secondaryAction: undefined } };

/** design.pen 11 장소 검색 · 결과 없음: 48 원형 비주얼, 줄바꿈 설명, 액션 없음 */
export const SearchNoResult: Story = {
  args: {
    visual: (
      <span className="flex size-12 items-center justify-center rounded-full text-[var(--color-text-muted)] shadow-[inset_0_0_0_1px_var(--color-border-default)]">
        <Icon name="search" size={32} />
      </span>
    ),
    title: "검색 결과가 없어요",
    description: '"동네 비밀식당"을\n신규 장소로 등록해 주세요.',
    primaryAction: undefined,
    secondaryAction: undefined,
  },
};
