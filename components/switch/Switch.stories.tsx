import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import { Switch, type SwitchSize } from "./Switch";

const meta = {
  title: "Components/Forms/Switch",
  component: Switch,
  args: { label: "알림 받기", size: "md", onCheckedChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 선택(행) × 상태(열), 사이즈별 영역 */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      {(["sm", "md"] as SwitchSize[]).map((size) => (
        <Section key={size} title={`${size} (${size === "sm" ? "32×16" : "40×20"})`}>
          <Matrix
            columns={["default", "disabled"]}
            rows={[false, true].map((on) => ({
              label: on ? "on" : "off",
              cells: [
                <Switch key="d" size={size} label={on ? "알림 받기" : "알림 끄기"} checked={on} />,
                <Switch key="x" size={size} label={on ? "알림 받기" : "알림 끄기"} checked={on} disabled />,
              ],
            }))}
          />
        </Section>
      ))}
    </Page>
  ),
};

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const toggle = canvas.getByRole("switch", { name: "알림 받기" });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};

export const On: Story = { args: { defaultChecked: true } };
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
