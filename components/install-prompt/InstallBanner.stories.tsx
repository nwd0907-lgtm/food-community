import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { InstallBanner } from "./InstallBanner";

// 앱 설치 유도 띠배너: 화면 하단 바텀 내비 위에 붙는다
const meta = {
  title: "Components/Feedback/InstallBanner",
  component: InstallBanner,
  parameters: { layout: "fullscreen" },
  args: { onInstall: fn(), onClose: fn() },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof InstallBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "앱 설치 안내" })).toBeVisible();
    await expect(canvas.getByText("FOOOD 앱 설치하기")).toBeVisible();
  },
};

/** 띠 어디를 눌러도 설치가 시작된다 */
export const ClickInstalls: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByText("홈 화면에서 바로 동네 맛집을 열어보세요"));
    await expect(args.onInstall).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "설치" }));
    await expect(args.onInstall).toHaveBeenCalledTimes(2);
  },
};

/** 닫기는 설치를 시작하지 않는다 */
export const CloseDoesNotInstall: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "설치 안내 닫기" }));
    await expect(args.onClose).toHaveBeenCalled();
    await expect(args.onInstall).not.toHaveBeenCalled();
  },
};
