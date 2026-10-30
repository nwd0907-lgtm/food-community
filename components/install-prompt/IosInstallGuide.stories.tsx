import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { InstallBanner } from "./InstallBanner";
import { IosInstallGuide } from "./IosInstallGuide";

// iOS 설치 안내 바텀시트: 띠배너를 누르면 열린다
const meta = {
  title: "Components/Feedback/IosInstallGuide",
  component: IosInstallGuide,
  parameters: { layout: "fullscreen" },
  args: { open: true, onClose: fn() },
  decorators: [(Story) => <div className="h-[520px] w-[360px]"><Story /></div>],
} satisfies Meta<typeof IosInstallGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = body.getByRole("dialog", { name: "홈 화면에 FOOOD 추가하기" });
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getAllByRole("listitem")).toHaveLength(3);
    await expect(within(dialog).getByRole("img", { name: "공유" })).toBeInTheDocument();
  },
};

function WithBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-full flex-col justify-end">
      <InstallBanner onInstall={() => setOpen(true)} onClose={() => {}} />
      <IosInstallGuide open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** 띠배너 탭 → 안내 바텀시트 → 확인으로 닫힘 */
export const FromBanner: Story = {
  render: () => <WithBanner />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "설치" }));
    await expect(body.getByRole("dialog")).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "확인" }));
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};
