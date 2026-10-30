import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Matrix, Page } from "../../stories/helpers/Matrix";
import { iconNames } from "../icon/Icon";
import { IconButton } from "./IconButton";

const meta = {
  title: "Components/Actions/IconButton",
  component: IconButton,
  args: { label: "좋아요", icon: "heart", variant: "ghost" },
  argTypes: { icon: { control: "select", options: iconNames } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 고스트 / 원형 브랜드 / 원형 뉴트럴 (48×48, 하트 24) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      <Matrix
        columns={["ghost", "circle-brand", "circle-neutral"]}
        rows={[
          {
            label: "heart · 48",
            cells: [
              <IconButton key="g" label="좋아요" variant="ghost" />,
              <IconButton key="b" label="좋아요" variant="circle-brand" />,
              <IconButton key="n" label="좋아요" variant="circle-neutral" />,
            ],
          },
        ]}
        cellWidth={120}
      />
    </Page>
  ),
};

export const Ghost: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "좋아요" });
    await expect(getComputedStyle(button).width).toBe("48px");
  },
};

export const CircleBrand: Story = {
  args: { variant: "circle-brand" },
  play: async ({ canvas }) => {
    // background-brand → brand-700(#BC2D09)
    await expect(getComputedStyle(canvas.getByRole("button")).backgroundColor).toBe("rgb(188, 45, 9)");
  },
};

export const CircleNeutral: Story = { args: { variant: "circle-neutral" } };

/** 56×56 플로팅 버튼 — design.pen 메인 맛집 등록 버튼 */
export const Large: Story = {
  args: { variant: "circle-brand", size: "lg", icon: "plus", label: "맛집 등록" },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole("button")).width).toBe("56px");
  },
};
