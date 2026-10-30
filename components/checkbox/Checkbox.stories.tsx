import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import { Checkbox, CheckboxGroup, type CheckboxSize } from "./Checkbox";

const meta = {
  title: "Components/Forms/Checkbox",
  component: Checkbox,
  args: { label: "이용약관에 동의합니다", size: "md" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const selections = [
  { label: "unchecked", props: { defaultChecked: false } },
  { label: "checked", props: { defaultChecked: true } },
  { label: "indeterminate", props: { indeterminate: true } },
];

/** 디자인 프레임 재현: 선택(행) × 상태(열), 사이즈별 영역 */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      {(["sm", "md"] as CheckboxSize[]).map((size) => (
        <Section key={size} title={`${size} (${size === "sm" ? 16 : 20})`}>
          <Matrix
            columns={["default", "disabled", "error"]}
            rows={selections.map(({ label, props }) => ({
              label,
              cells: [
                <Checkbox key="d" size={size} label="이용약관에 동의합니다" {...props} />,
                <Checkbox key="x" size={size} label="이용약관에 동의합니다" disabled {...props} />,
                <Checkbox key="e" size={size} label="이용약관에 동의합니다" error {...props} />,
              ],
            }))}
          />
        </Section>
      ))}
    </Page>
  ),
};

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "이용약관에 동의합니다" });
    await userEvent.click(canvas.getByText("이용약관에 동의합니다"));
    await expect(checkbox).toBeChecked();
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = {
  args: { indeterminate: true, label: "전체 동의" },
  play: async ({ canvas }) => {
    await expect((canvas.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
  },
};

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const ErrorState: Story = { args: { error: true } };

/** 그룹 사용: 에러 메시지는 그룹 아래에 한 번만 */
export const Group: Story = {
  render: () => (
    <CheckboxGroup legend="약관 동의" errorMessage="필수 약관에 모두 동의해 주세요.">
      <Checkbox label="[필수] 서비스 이용약관" />
      <Checkbox label="[필수] 개인정보 처리방침" defaultChecked />
      <Checkbox label="[선택] 마케팅 정보 수신" />
    </CheckboxGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("필수 약관에 모두 동의해 주세요.")).toHaveLength(1);
    await expect(canvas.getByRole("group", { name: "약관 동의" })).toHaveAccessibleDescription(
      "필수 약관에 모두 동의해 주세요.",
    );
  },
};
