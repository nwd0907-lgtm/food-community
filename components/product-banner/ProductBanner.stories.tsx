import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ProductBanner } from "./ProductBanner";

// design.pen 상품 배너 / 강연·모임
const meta = {
  title: "Components/Etc/ProductBanner",
  component: ProductBanner,
  args: {
    href: "/products/cooking-class",
    image: {
      src: "/images/banners/cooking-class-red.png",
      alt: "칼질 몰라도 괜찮아! 누구나 할 수 있는 원데이 요리교실. 지금 바로 참여하기",
    },
  },
  decorators: [(Story) => <div className="w-[328px]"><Story /></div>],
} satisfies Meta<typeof ProductBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 328 × 164(2:1), 라운드 16 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /원데이 요리교실/ });
    await expect(link).toHaveAttribute("href", "/products/cooking-class");
    await expect(link).toHaveStyle({ borderRadius: "16px" });
  },
};

/** 메인 상단: 화면 끝까지 붙여 라운드 없음 */
export const FullBleed: Story = {
  args: { rounded: false },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link")).toHaveStyle({ borderRadius: "0px" });
  },
};

/** 3:1 배너를 2:1 칸에 넣을 때: 왼쪽 문구가 잘리지 않게 위치를 옮긴다 */
export const WideImage: Story = {
  args: {
    image: {
      src: "/images/banners/cooking-class-warm-marble.png",
      alt: "칼질 몰라도 괜찮아! 누구나 할 수 있는 원데이 요리교실. 지금 바로 참여하기",
    },
    imageClassName: "object-[30%_50%]",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img")).toHaveClass("object-[30%_50%]");
  },
};
