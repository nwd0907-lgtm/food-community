import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import type { FieldSize } from "../field/field";
import { iconNames } from "../icon/Icon";
import { TextField } from "./TextField";

const meta = {
  title: "Components/Forms/TextField",
  component: TextField,
  args: {
    label: "가게 이름",
    placeholder: "가게 이름을 입력하세요",
    helperText: "한글 30자 이내로 입력해 주세요.",
    size: "md",
  },
  argTypes: {
    leadingIcon: { control: "select", options: [undefined, ...iconNames] },
    trailingIcon: { control: "select", options: [undefined, ...iconNames] },
  },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: FieldSize[] = ["sm", "md", "lg"];

function row(type: "text" | "password", size: FieldSize) {
  const common = {
    type,
    size,
    label: type === "text" ? "가게 이름" : "비밀번호",
    helperText: "한글 30자 이내로 입력해 주세요.",
    defaultValue: type === "text" ? "오후의 화덕" : "password",
    leadingIcon: type === "text" && size !== "sm" ? ("user" as const) : undefined,
    trailingIcon: type === "text" && size === "lg" ? ("close" as const) : undefined,
  };
  return {
    label: `${size} (${{ sm: 32, md: 40, lg: 48 }[size]})`,
    cells: [
      <TextField key="d" {...common} />,
      <TextField key="f" {...common} focused />,
      <TextField key="x" {...common} disabled defaultValue={type === "text" ? "입력할 수 없어요" : "password"} />,
      <TextField key="e" {...common} errorMessage="필수 항목을 확인해 주세요." />,
    ],
  };
}

/** 디자인 프레임 재현: 타입(text, password)별 영역 × 상태 열 × 사이즈 행 */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
  render: () => (
    <Page>
      {(["text", "password"] as const).map((type) => (
        <Section key={type} title={type}>
          <Matrix columns={["default", "focused", "disabled", "error"]} rows={sizes.map((size) => row(type, size))} cellWidth={260} />
        </Section>
      ))}
    </Page>
  ),
};

export const Default: Story = {
  args: { leadingIcon: "user" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText("가게 이름");
    await userEvent.type(input, "오후의 화덕");
    await expect(input).toHaveValue("오후의 화덕");
    await expect(input).toHaveAccessibleDescription("한글 30자 이내로 입력해 주세요.");
  },
};

export const Password: Story = {
  args: { type: "password", label: "비밀번호", placeholder: "비밀번호를 입력하세요" },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("비밀번호")).toHaveAttribute("type", "password");
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: "입력할 수 없어요" } };

export const ErrorState: Story = {
  args: { errorMessage: "필수 항목을 확인해 주세요." },
  play: async ({ canvas }) => {
    // 에러 문구가 힌트를 대체한다
    const input = canvas.getByLabelText("가게 이름");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("필수 항목을 확인해 주세요.");
    await expect(canvas.queryByText("한글 30자 이내로 입력해 주세요.")).toBeNull();
  },
};

/** 필수 표시(*) — 레이블 옆 에러 색 별표, 입력에는 aria-required */
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-required", "true");
    await expect(canvas.getByText("*")).toHaveAttribute("aria-hidden", "true");
  },
};

/** 우측 아이콘을 버튼으로: 입력 지우기 (design.pen Trailing Clear Icon) */
export const ClearButton: Story = {
  args: {
    size: "lg",
    defaultValue: "오후의 화덕",
    trailingIcon: "close",
    trailingIconLabel: "가게 이름 지우기",
    onTrailingIconClick: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "가게 이름 지우기" }));
    await expect(args.onTrailingIconClick).toHaveBeenCalled();
  },
};

/** 메인 검색 필드: 레이블 숨김 + pill 라운드 + 검색 아이콘 */
export const Search: Story = {
  args: {
    label: "맛집 검색",
    hideLabel: true,
    shape: "pill",
    size: "lg",
    leadingIcon: "search",
    helperText: undefined,
    placeholder: "숨은맛집은 Foood에서",
  },
  play: async ({ canvas }) => {
    // 레이블은 보이지 않지만 접근성 이름으로 남는다
    await expect(canvas.getByRole("textbox", { name: "맛집 검색" })).toBeVisible();
    await expect(getComputedStyle(canvas.getByRole("textbox").parentElement!).borderRadius).not.toBe("12px");
  },
};

/** 메인 검색(브랜드): 테두리 1px · 검색 아이콘 · 플레이스홀더를 브랜드 버튼과 같은 색으로 */
export const SearchBrand: Story = {
  args: { ...Search.args, tone: "brand" },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("textbox").parentElement!;
    await expect(getComputedStyle(box).boxShadow).toContain("1px");
  },
};
