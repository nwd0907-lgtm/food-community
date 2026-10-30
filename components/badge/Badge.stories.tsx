import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Matrix, Page } from "../../stories/helpers/Matrix";
import { Badge, type BadgeTone } from "./Badge";

const tones: BadgeTone[] = ["neutral", "success", "error", "info", "warning"];

const meta = {
  title: "Components/Etc/Badge",
  component: Badge,
  args: { label: "이웃 인증", tone: "neutral", size: "md" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 타입(행) × 사이즈(열) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      <Matrix
        columns={["md (20)", "lg (24)"]}
        rows={tones.map((tone) => ({
          label: tone,
          cells: [<Badge key="md" tone={tone} label={tone} />, <Badge key="lg" tone={tone} label={tone} size="lg" />],
        }))}
        cellWidth={120}
      />
    </Page>
  ),
};

export const Neutral: Story = {
  play: async ({ canvas }) => {
    const badge = canvas.getByText("이웃 인증").parentElement!;
    await expect(getComputedStyle(badge).height).toBe("20px");
    await expect(getComputedStyle(badge).paddingLeft).toBe("8px");
  },
};

export const Success: Story = { args: { tone: "success", label: "영업 중" } };
export const ErrorTone: Story = { args: { tone: "error", label: "영업 종료" } };
export const Info: Story = { args: { tone: "info", label: "새 소식" } };
export const Warning: Story = { args: { tone: "warning", label: "곧 마감" } };
export const Large: Story = { args: { size: "lg" } };
