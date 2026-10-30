import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { TabNavigation } from "./TabNavigation";

// design.pen navigation/tab/3-items
const meta = {
  title: "Components/Navigation/TabNavigation",
  component: TabNavigation,
  args: {
    label: "피드 정렬",
    items: [
      { value: "recommend", label: "추천" },
      { value: "latest", label: "최신" },
      { value: "saved", label: "저장" },
    ],
    defaultValue: "recommend",
    onChange: fn(),
  },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeItems: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "최신" }));
    await expect(canvas.getByRole("tab", { name: "최신" })).toHaveAttribute("aria-selected", "true");
    // 화살표 키로 이동
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "저장" })).toHaveFocus();
    await expect(args.onChange).toHaveBeenLastCalledWith("saved");
  },
};

export const TwoItems: Story = {
  args: {
    items: [
      { value: "review", label: "리뷰" },
      { value: "photo", label: "사진" },
    ],
    defaultValue: "review",
  },
};

/** 비활성 아이템 — design.pen 마이페이지 "구매 내역" */
export const WithDisabledItem: Story = {
  args: {
    label: "마이페이지 탭",
    items: [
      { value: "mine", label: "내 맛집" },
      { value: "orders", label: "구매 내역", disabled: true },
    ],
    defaultValue: "mine",
  },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("tab", { name: "구매 내역" })).toBeDisabled();
    // 비활성 아이템은 키보드 이동에서 건너뛴다
    canvas.getByRole("tab", { name: "내 맛집" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "내 맛집" })).toHaveAttribute("aria-selected", "true");
    await expect(args.onChange).not.toHaveBeenCalledWith("orders");
  },
};
