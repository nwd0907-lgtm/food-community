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

/** design.pen 13 결제 바텀시트: contentClassName으로 좌우 20, 제목 바로 아래 요약 · 결제하기 */
export const PaymentSummary: Story = {
  args: { title: "결제 정보", description: undefined, contentClassName: "px-5 pb-2" },
  render: (args) => (
    <BottomSheet {...args}>
      <dl className="flex flex-col gap-3.5 py-5">
        {[
          ["참여 현황", "12 / 30명"],
          ["결제 인원", "1명"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <dt className="text-[var(--color-text-muted)]">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <Button size="lg" fullWidth>
        결제하기
      </Button>
    </BottomSheet>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = body.getByRole("dialog", { name: "결제 정보" });
    await expect(dialog.querySelector("div.px-5")).not.toBeNull();
    await expect(dialog.querySelector("div.px-6")).toBeNull();
  },
};
