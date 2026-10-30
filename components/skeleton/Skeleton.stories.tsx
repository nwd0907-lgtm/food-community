import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Matrix, Page } from "../../stories/helpers/Matrix";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  args: { variant: "text", width: 240 },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 텍스트형 · 사각형 · 원형 */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      <Matrix
        columns={["text", "rectangle", "circle"]}
        rows={[
          {
            label: "",
            cells: [
              <Skeleton key="t" variant="text" width={240} />,
              <Skeleton key="r" variant="rectangle" width={240} height={96} />,
              <Skeleton key="c" variant="circle" size={64} />,
            ],
          },
        ]}
        cellWidth={260}
      />
    </Page>
  ),
};

export const Text: Story = {
  args: { variant: "text", typography: "heading-lg", width: 240 },
  play: async ({ canvasElement }) => {
    // 텍스트형 높이 = heading-lg 행 높이(24 × 1.2 = 28.8px)
    const el = canvasElement.querySelector('[data-variant="text"]')!;
    await expect(parseFloat(getComputedStyle(el).height)).toBeCloseTo(28.8, 1);
  },
};

export const Rectangle: Story = { args: { variant: "rectangle", width: 240, height: 96 } };
export const Circle: Story = { args: { variant: "circle", size: 64 } };

/** 카드 로딩 예시 */
export const CardPlaceholder: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-3">
      <Skeleton variant="rectangle" width="100%" height={190} />
      <Skeleton variant="text" typography="heading-md" width="60%" />
      <Skeleton variant="text" typography="body-md" />
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" size={32} />
        <Skeleton variant="text" typography="label-md" width={120} />
      </div>
    </div>
  ),
};
