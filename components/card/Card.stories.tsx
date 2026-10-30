import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Card } from "./Card";

// design.pen card/default
const meta = {
  title: "Components/Etc/Card",
  component: Card,
  args: {
    title: "도림천 면옥",
    image: { src: "/images/kenhome-1991.jpeg", alt: "켄홈 1991 가게 입구" },
    imageBadge: "이웃 인증",
    meta: { icon: "car-front", label: "차로 18분" },
    description: "직접 뽑은 메밀면과 슴슴한 육수. 주차는 건물 뒤 4대 가능.",
    tags: ["주차 가능", "아이와"],
  },
  decorators: [(Story) => <div className="w-[328px]"><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "켄홈 1991 가게 입구" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "도림천 면옥" })).toBeVisible();
  },
};

/** 이미지 영역 제외 */
export const WithoutImage: Story = { args: { image: undefined, imageBadge: undefined } };

export const Minimal: Story = {
  args: { image: undefined, imageBadge: undefined, meta: undefined, tags: undefined },
};

/** 메인 피드 — 간격 4, 제목 heading-sm, 설명 한 줄 */
export const Feed: Story = {
  args: { size: "md", imageBadge: undefined, meta: undefined, tags: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "도림천 면옥" })).toHaveStyle({ fontSize: "16px" });
  },
};

/** 마이페이지 2열 — 이미지 112, 라운드 8 */
export const Compact: Story = {
  args: { size: "sm", imageBadge: undefined, meta: undefined, tags: undefined },
  decorators: [(Story) => <div className="w-[158px]"><Story /></div>],
  play: async ({ canvas }) => {
    const image = canvas.getByRole("img", { name: "켄홈 1991 가게 입구" }).parentElement!;
    await expect(getComputedStyle(image).height).toBe("112px");
  },
};
