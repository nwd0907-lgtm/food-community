import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Matrix, Page } from "../../stories/helpers/Matrix";
import type { FieldSize } from "../field/field";
import { SelectItem } from "./SelectItem";

const meta = {
  title: "Components/Forms/SelectItem",
  component: SelectItem,
  args: { label: "오후 7시", size: "md" },
  decorators: [(Story) => <ul role="listbox" aria-label="모임 시간" className="w-[280px]"><Story /></ul>],
} satisfies Meta<typeof SelectItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: FieldSize[] = ["sm", "md", "lg"];

/** 디자인 프레임 재현: 상태(열) × 사이즈(행) — 사이즈는 참조하는 셀렉트를 따른다 */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
  render: () => (
    <Page>
      <Matrix
        columns={["default", "selected", "disabled"]}
        rows={sizes.map((size) => ({
          label: `${size} (${{ sm: 32, md: 40, lg: 48 }[size]})`,
          cells: [
            <ul key="d" role="listbox" aria-label="default"><SelectItem label="오후 7시" size={size} /></ul>,
            <ul key="s" role="listbox" aria-label="selected"><SelectItem label="오후 7시" size={size} selected /></ul>,
            <ul key="x" role="listbox" aria-label="disabled"><SelectItem label="오후 7시" size={size} disabled /></ul>,
          ],
        }))}
        cellWidth={240}
      />
    </Page>
  ),
};

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };
