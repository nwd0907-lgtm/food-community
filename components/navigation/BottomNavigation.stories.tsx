import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { BottomNavigation, type BottomNavigationItem } from "./BottomNavigation";

// design.pen navigation/bottom/4-items
const items: BottomNavigationItem[] = [
  { value: "home", label: "홈", icon: "home" },
  { value: "discover", label: "발견", icon: "compass" },
  { value: "log", label: "기록", icon: "notebook-tabs" },
  { value: "my", label: "마이", icon: "user-round" },
];

const meta = {
  title: "Components/Navigation/BottomNavigation",
  component: BottomNavigation,
  args: { items, defaultValue: "home", onChange: fn() },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourItems: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("button", { name: "홈" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "발견" }));
    await expect(canvas.getByRole("button", { name: "발견" })).toHaveAttribute("aria-current", "page");
    await expect(args.onChange).toHaveBeenCalledWith("discover");
    // 선택 아이콘은 필(Phosphor), 미선택은 아웃라인(Lucide)
    await expect(canvas.getByRole("button", { name: "발견" }).querySelector("svg.lucide")).toBeNull();
    await expect(canvas.getByRole("button", { name: "홈" }).querySelector("svg.lucide")).not.toBeNull();
  },
};

export const TwoItems: Story = { args: { items: items.slice(0, 2) } };

export const FiveItems: Story = {
  args: { items: [...items.slice(0, 2), { value: "add", label: "등록", icon: "plus" }, ...items.slice(2)] },
};

export const IconOnly: Story = { args: { showLabels: false } };
