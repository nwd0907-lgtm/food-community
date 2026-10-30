import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Button } from "../button/Button";
import { Modal, type ModalProps } from "./Modal";

// design.pen modal/default
const meta = {
  title: "Components/Etc/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onClose: fn(),
    title: "맛집 등록을 취소할까요?",
    children: "작성한 내용은 저장되지 않습니다. 정말 화면을 닫으시겠어요?",
    secondaryAction: { label: "계속 작성", onClick: fn() },
    primaryAction: { label: "나가기", onClick: fn() },
  },
  decorators: [(Story) => <div className="h-[420px]"><Story /></div>],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("dialog", { name: "맛집 등록을 취소할까요?" })).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "나가기" }));
    await expect(args.primaryAction?.onClick).toHaveBeenCalled();
  },
};

function Controlled(args: ModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <Modal {...args} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** 스크림을 탭하면 닫힌다 */
export const ScrimCloses: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "모달 열기" }));
    await expect(body.getByRole("dialog")).toBeVisible();
    await userEvent.click(body.getByTestId("modal-scrim"));
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};

export const EscapeCloses: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "모달 열기" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};
