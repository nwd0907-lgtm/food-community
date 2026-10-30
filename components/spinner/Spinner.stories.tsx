import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Spinner } from "./Spinner";

// design.pen spinner/md: 24, 브랜드 컬러
const meta = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Medium: Story = {
  play: async ({ canvas }) => {
    const status = canvas.getByRole("status", { name: "로딩 중" });
    await expect(getComputedStyle(status.querySelector("svg")!).color).toBe("rgb(188, 45, 9)");
  },
};

export const CustomLabel: Story = { args: { label: "맛집 목록을 불러오는 중" } };
