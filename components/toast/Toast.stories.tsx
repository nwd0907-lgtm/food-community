import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Page } from "../../stories/helpers/Matrix";
import { Toast, type ToastType } from "./Toast";

const messages: Record<ToastType, string> = {
  success: "저장되었습니다.",
  error: "저장하지 못했습니다. 다시 시도해 주세요.",
  info: "새로운 업데이트가 준비되었습니다.",
  warning: "입력 내용을 다시 확인해 주세요.",
};

const meta = {
  title: "Components/Feedback/Toast",
  component: Toast,
  args: { type: "success", message: messages.success, onClose: fn() },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 타입별 1행 (데스크톱 400px) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      <div className="flex flex-col gap-4">
        {(Object.keys(messages) as ToastType[]).map((type) => (
          <Toast key={type} type={type} message={messages[type]} onClose={() => {}} />
        ))}
      </div>
    </Page>
  ),
};

export const Success: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent(messages.success);
    await userEvent.click(canvas.getByRole("button", { name: "닫기" }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const ErrorType: Story = {
  args: { type: "error", message: messages.error },
  play: async ({ canvas }) => {
    // 에러는 즉시 읽히도록 alert
    await expect(canvas.getByRole("alert")).toBeVisible();
  },
};

export const Info: Story = { args: { type: "info", message: messages.info } };
export const Warning: Story = { args: { type: "warning", message: messages.warning } };
export const WithoutClose: Story = { args: { onClose: undefined } };

/** 모바일: 화면 너비 - 좌우 마진 */
export const Mobile: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="w-[360px] px-4 py-6">
      <Toast {...args} />
    </div>
  ),
};
