import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Matrix, Page } from "../../stories/helpers/Matrix";
import { Textarea } from "./Textarea";

const sample = "직접 뽑은 메밀면과 슴슴한 육수";

const meta = {
  title: "Components/Forms/Textarea",
  component: Textarea,
  args: {
    label: "추천 이야기",
    placeholder: "추천 메뉴와 방문 팁을 적어 주세요.",
    helperText: "최대 300자",
    maxLength: 300,
    showCounter: true,
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 상태 열 (고정 높이 3줄) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
  render: (args) => (
    <Page>
      <Matrix
        columns={["default", "focused", "disabled", "error"]}
        rows={[
          {
            label: "3줄 고정",
            cells: [
              <Textarea key="d" {...args} defaultValue={sample} />,
              <Textarea key="f" {...args} defaultValue={sample} focused />,
              <Textarea key="x" {...args} defaultValue="입력할 수 없어요" disabled />,
              <Textarea key="e" {...args} defaultValue={sample} errorMessage="10자 이상 입력해 주세요." />,
            ],
          },
        ]}
        cellWidth={280}
      />
    </Page>
  ),
};

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    // 입력하면 글자수 카운터가 갱신된다
    await userEvent.type(canvas.getByLabelText("추천 이야기"), "메밀면");
    await expect(canvas.getByText("3 / 300")).toBeVisible();
  },
};

export const Overflow: Story = {
  args: { defaultValue: Array.from({ length: 8 }, (_, i) => `${i + 1}번째 줄 방문 팁`).join("\n") },
  play: async ({ canvas }) => {
    // 3줄 고정 높이, 초과분은 스크롤
    const textarea = canvas.getByLabelText("추천 이야기");
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: "입력할 수 없어요" } };
export const ErrorState: Story = { args: { defaultValue: sample, errorMessage: "10자 이상 입력해 주세요." } };
export const WithoutCounter: Story = { args: { showCounter: false } };

/** 필수 표시(*) */
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  },
};
