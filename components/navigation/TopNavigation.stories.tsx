import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { TopNavigation } from "./TopNavigation";

const meta = {
  title: "Components/Navigation/TopNavigation",
  component: TopNavigation,
  args: {
    title: "이웃의 발견",
    leftAction: { label: "뒤로 가기", icon: "arrow-left", onClick: fn() },
  },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof TopNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** design.pen navigation/top/default */
export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("heading", { name: "이웃의 발견" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "뒤로 가기" }));
    await expect(args.leftAction?.onClick).toHaveBeenCalled();
  },
};

export const WithRightActions: Story = {
  args: {
    rightActions: [
      { label: "검색", icon: "search" },
      { label: "공유", icon: "share" },
    ],
  },
};

export const TitleOnly: Story = { args: { leftAction: undefined } };

/** 배경·구분선은 전체 폭, 아이콘·제목은 안쪽 영역(예: 데스크톱 1280) 양끝에 맞춘다 */
export const ConstrainedContent: Story = {
  args: {
    rightActions: [{ label: "공유", icon: "share" }],
    contentClassName: "mx-auto max-w-[480px]",
  },
  decorators: [(Story) => <div className="w-[800px]"><Story /></div>],
};
