import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Button } from "../button/Button";
import { MenuList } from "../menu/Menu";
import { BottomSheet, type BottomSheetProps } from "./BottomSheet";

// design.pen bottom-sheet/default
const meta = {
  title: "Components/Etc/BottomSheet",
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onClose: fn(),
    title: "정렬 기준을 선택하세요",
    description: "선택하지 않고 배경을 탭하면 바텀시트가 닫힙니다.",
  },
  render: (args) => (
    <BottomSheet {...args}>
      <MenuList
        bare
        label="정렬 기준"
        items={[
          { label: "최신순", icon: "edit" },
          { label: "가까운 순", icon: "refresh" },
        ]}
      />
      <Button fullWidth>선택 완료</Button>
    </BottomSheet>
  ),
  decorators: [(Story) => <div className="h-[520px] w-[360px]"><Story /></div>],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("dialog", { name: "정렬 기준을 선택하세요" })).toBeVisible();
  },
};

function Controlled(args: BottomSheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>정렬</Button>
      <BottomSheet {...args} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** 스크림을 탭하면 선택 없이 닫힌다 */
export const ScrimCloses: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "정렬" }));
    await expect(body.getByRole("dialog")).toBeVisible();
    await userEvent.click(body.getByTestId("bottom-sheet-scrim"));
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};
