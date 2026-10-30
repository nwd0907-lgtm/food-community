import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import { RadioGroup, type RadioSize } from "./RadioGroup";

const times = [
  { value: "17", label: "오후 5시" },
  { value: "19", label: "오후 7시" },
  { value: "21", label: "오후 9시" },
];

const meta = {
  title: "Components/Forms/Radio",
  component: RadioGroup,
  args: { label: "모임 시간", options: times, defaultValue: "19", size: "md", onChange: fn() },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const one = (selected: boolean) => [{ value: selected ? "19" : "17", label: selected ? "오후 7시" : "오후 5시" }];

/** 디자인 프레임 재현: 선택(행) × 상태(열), 사이즈별 영역 (단독 사용 금지라 셀마다 1개짜리 그룹) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      {(["sm", "md"] as RadioSize[]).map((size) => (
        <Section key={size} title={`${size} (${size === "sm" ? 16 : 20})`}>
          <Matrix
            columns={["default", "disabled"]}
            rows={[false, true].map((selected) => ({
              label: selected ? "selected" : "unselected",
              cells: [false, true].map((disabled) => (
                <RadioGroup
                  key={String(disabled)}
                  label="모임 시간"
                  hideLabel
                  size={size}
                  disabled={disabled}
                  options={one(selected)}
                  value={selected ? "19" : undefined}
                />
              )),
            }))}
          />
        </Section>
      ))}
    </Page>
  ),
};

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByText("오후 9시"));
    await expect(canvas.getByRole("radio", { name: "오후 9시" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "오후 7시" })).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith("21");
  },
};

export const Small: Story = { args: { size: "sm" } };
export const Horizontal: Story = { args: { direction: "horizontal" } };
export const WithDisabledOption: Story = {
  args: { options: [...times.slice(0, 2), { value: "21", label: "오후 9시 (마감)", disabled: true }] },
};
export const Disabled: Story = { args: { disabled: true } };
