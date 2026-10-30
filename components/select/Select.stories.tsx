import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { Matrix, Page } from "../../stories/helpers/Matrix";
import type { FieldSize } from "../field/field";
import { Select } from "./Select";

const times = [
  { value: "17", label: "오후 5시" },
  { value: "19", label: "오후 7시" },
  { value: "21", label: "오후 9시" },
  { value: "23", label: "오후 11시", disabled: true },
];

const meta = {
  title: "Components/Forms/Select",
  component: Select,
  args: {
    label: "모임 시간",
    options: times,
    defaultValue: "19",
    helperText: "한 가지 시간을 선택하세요.",
    size: "md",
    onChange: fn(),
  },
  decorators: [(Story) => <div className="h-[320px] w-[320px]"><Story /></div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: FieldSize[] = ["sm", "md", "lg"];

/** 디자인 프레임 재현: 상태(열) × 사이즈(행). focused = 패널이 열린 상태 */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
  render: () => (
    <Page>
      <Matrix
        columns={["default", "focused", "disabled", "error"]}
        rows={sizes.map((size) => ({
          label: `${size} (${{ sm: 32, md: 40, lg: 48 }[size]})`,
          cells: [
            <Select key="d" label="모임 시간" options={times} defaultValue="19" size={size} helperText="한 가지 시간을 선택하세요." />,
            <Select key="f" label="모임 시간" options={times} defaultValue="19" size={size} helperText="옵션 패널이 열려 있습니다." focused defaultOpen={size === "lg"} />,
            <Select key="x" label="모임 시간" options={times} size={size} placeholder="선택할 수 없어요" helperText="한 가지 시간을 선택하세요." disabled />,
            <Select key="e" label="모임 시간" options={times} defaultValue="19" size={size} errorMessage="시간을 선택해 주세요." />,
          ],
        }))}
        cellWidth={260}
      />
    </Page>
  ),
};

/** 데스크톱: 셀렉트 아래에 셀렉트아이템 */
export const Dropdown: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("option", { name: "오후 9시" }));
    await expect(args.onChange).toHaveBeenCalledWith("21");
    await expect(trigger).toHaveTextContent("오후 9시");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith("21");
  },
};

/** 모바일: 바텀시트 안에 셀렉트아이템 */
export const Sheet: Story = {
  args: { presentation: "sheet" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    const sheet = within(canvasElement.ownerDocument.body).getByRole("dialog");
    await userEvent.click(within(sheet).getByRole("option", { name: "오후 5시" }));
    await expect(args.onChange).toHaveBeenCalledWith("17");
  },
};

export const Placeholder: Story = { args: { defaultValue: undefined, placeholder: "시간을 선택하세요" } };
export const Disabled: Story = { args: { disabled: true } };
export const ErrorState: Story = { args: { errorMessage: "시간을 선택해 주세요." } };
