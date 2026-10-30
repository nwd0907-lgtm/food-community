import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import { iconNames } from "../icon/Icon";
import { MenuItem, type MenuItemSize } from "./MenuItem";

const meta = {
  title: "Components/Etc/MenuItem",
  component: MenuItem,
  args: { label: "수정", icon: "edit", size: "md" },
  argTypes: { icon: { control: "select", options: [undefined, ...iconNames] } },
  decorators: [(Story) => <div role="menu" aria-label="메뉴" className="w-60"><Story /></div>],
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: MenuItemSize[] = ["sm", "md", "lg"];

/** 디자인 프레임 재현: 타입별 영역 × 상태(열) × 사이즈(행) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
  render: () => (
    <Page>
      {(["default", "destructive"] as const).map((variant) => (
        <Section key={variant} title={variant}>
          <Matrix
            columns={["default", "disabled"]}
            rows={sizes.map((size) => ({
              label: `${size} (${{ sm: 32, md: 40, lg: 48 }[size]})`,
              cells: [false, true].map((disabled) => (
                <div key={String(disabled)} role="menu" aria-label={`${variant} ${size}`} className="w-60">
                  <MenuItem
                    variant={variant}
                    size={size}
                    disabled={disabled}
                    label={variant === "destructive" ? "삭제" : "수정"}
                    icon={variant === "destructive" ? "delete" : "edit"}
                  />
                </div>
              )),
            }))}
            cellWidth={240}
          />
        </Section>
      ))}
    </Page>
  ),
};

export const Default: Story = {};

export const Destructive: Story = {
  args: { variant: "destructive", label: "삭제", icon: "delete" },
  play: async ({ canvas }) => {
    // text-error → red-700 #B42318
    await expect(getComputedStyle(canvas.getByRole("menuitem")).color).toBe("rgb(180, 35, 24)");
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const WithoutIcon: Story = { args: { icon: undefined } };
