import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { Menu, MenuList, type MenuAction } from "./Menu";

// design.pen menu/default
const onEdit = fn();
const onDelete = fn();
const items: MenuAction[] = [
  { label: "수정", icon: "edit", onSelect: onEdit },
  { label: "복사", icon: "copy" },
  { label: "삭제", icon: "delete", variant: "destructive", onSelect: onDelete },
];

const meta = {
  title: "Components/Etc/Menu",
  component: Menu,
  args: { items, triggerLabel: "더보기" },
  decorators: [(Story) => <div className="flex h-[240px] w-[320px] justify-end"><Story /></div>],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 메뉴 패널 단독 (디자인 프레임과 동일) */
export const Panel: Story = {
  render: () => <MenuList items={items} label="게시글 메뉴" />,
};

/** 데스크톱: 메뉴버튼 아래에 메뉴아이템 */
export const Dropdown: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "더보기" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("menuitem", { name: "수정" }));
    await expect(onEdit).toHaveBeenCalled();
    await expect(canvas.queryByRole("menu")).toBeNull();
  },
};

/** 모바일: 바텀시트 안 메뉴아이템 */
export const Sheet: Story = {
  args: { presentation: "sheet", sheetTitle: "게시글 관리" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "더보기" }));
    const sheet = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: "게시글 관리" });
    await userEvent.click(within(sheet).getByRole("menuitem", { name: "삭제" }));
    await expect(onDelete).toHaveBeenCalled();
  },
};

export const Small: Story = { args: { size: "sm", defaultOpen: true } };
