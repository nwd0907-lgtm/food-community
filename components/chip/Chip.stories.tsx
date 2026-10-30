import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import { iconNames } from "../icon/Icon";
import { Chip, type ChipSize } from "./Chip";

const meta = {
  title: "Components/Forms/Chip",
  component: Chip,
  args: { label: "화덕구이", size: "md", onSelectedChange: fn() },
  argTypes: { icon: { control: "select", options: [undefined, ...iconNames] } },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 선택(행) × 상태(열), 사이즈별 영역 (sm은 아이콘 없음, md는 좌측 아이콘) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      {(["sm", "md"] as ChipSize[]).map((size) => (
        <Section key={size} title={`${size} (${size === "sm" ? 24 : 32})`}>
          <Matrix
            columns={["default", "disabled"]}
            rows={[false, true].map((selected) => ({
              label: selected ? "selected" : "unselected",
              cells: [false, true].map((disabled) => (
                <Chip
                  key={String(disabled)}
                  size={size}
                  icon={size === "md" ? "star" : undefined}
                  label={selected ? "선택됨" : "화덕구이"}
                  selected={selected}
                  disabled={disabled}
                />
              )),
            }))}
            cellWidth={140}
          />
        </Section>
      ))}
    </Page>
  ),
};

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const chip = canvas.getByRole("button", { name: "화덕구이" });
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(args.onSelectedChange).toHaveBeenCalledWith(true);
  },
};

export const WithIcon: Story = {
  args: { icon: "star" },
  play: async ({ canvas }) => {
    // md 좌측 아이콘 있음 → 좌우 패딩 8
    await expect(getComputedStyle(canvas.getByRole("button")).paddingLeft).toBe("8px");
  },
};

export const Selected: Story = { args: { defaultSelected: true, label: "선택됨" } };
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true } };
