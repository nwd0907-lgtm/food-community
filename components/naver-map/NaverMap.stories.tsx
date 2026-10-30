import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { IconButton } from "../icon-button/IconButton";
import { NaverMap } from "./NaverMap";

// design.pen 09 장소 등록(지도) · 02 상세(미니 지도)
// NEXT_PUBLIC_NCP_MAPS_KEY_ID가 없는 환경(CI 등)에서는 지도 배경색 + 핀만 보인다
const meta = {
  title: "Components/Etc/NaverMap",
  component: NaverMap,
  args: { center: { latitude: 37.5447, longitude: 127.0557 }, label: "장소 선택 지도" },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof NaverMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 장소 등록: 조작 가능한 큰 지도 + 현재 위치 버튼 */
export const Picker: Story = {
  args: {
    className: "h-[538px]",
    children: (
      <IconButton
        label="현재 위치로 이동"
        icon="navigation"
        className="absolute right-3.5 bottom-5 z-10 size-11 bg-[var(--color-background-surface)]! text-[var(--color-text-brand)]! shadow-[0_2px_8px_#1717141F]"
      />
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "장소 선택 지도" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "현재 위치로 이동" })).toBeInTheDocument();
  },
};

/** 상세: 조작을 막은 미니 지도(높이 160, 라운드 12) */
export const Preview: Story = {
  args: { interactive: false, label: "켄홈 위치 지도", className: "h-40 rounded-xl" },
};
