import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import { iconNames } from "../icon/Icon";
import { Button, type ButtonSize, type ButtonType } from "./Button";

const meta = {
  title: "Components/Actions/Button",
  component: Button,
  args: { children: "계속하기", variant: "primary", size: "md", leadingIcon: "plus", onClick: fn() },
  argTypes: {
    leadingIcon: { control: "select", options: [undefined, ...iconNames] },
    trailingIcon: { control: "select", options: [undefined, ...iconNames] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const types: ButtonType[] = ["primary", "secondary", "destructive"];
const sizes: ButtonSize[] = ["sm", "md", "lg"];

/** 디자인 프레임 재현: 타입별 영역 × (상태 열, 사이즈 행) */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <Page>
      {types.map((type) => (
        <Section key={type} title={type}>
          <Matrix
            columns={["default", "disabled", "loading"]}
            rows={sizes.map((size) => ({
              label: `${size} (${{ sm: 32, md: 40, lg: 48 }[size]})`,
              cells: [
                <Button key="d" variant={type} size={size} leadingIcon={size === "sm" ? undefined : "plus"} trailingIcon={size === "lg" ? "arrow-right" : undefined}>
                  계속하기
                </Button>,
                <Button key="x" variant={type} size={size} leadingIcon={size === "sm" ? undefined : "plus"} disabled>
                  계속하기
                </Button>,
                <Button key="l" variant={type} size={size} loading>
                  계속하기
                </Button>,
              ],
            }))}
          />
        </Section>
      ))}
    </Page>
  ),
};

export const Primary: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "계속하기" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive", leadingIcon: "delete", children: "삭제하기" } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "계속하기" })).toBeDisabled();
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas }) => {
    // 레이블은 유지되고 클릭은 막힌다
    const button = canvas.getByRole("button", { name: "계속하기" });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toBeDisabled();
  },
};

export const WithTrailingIcon: Story = { args: { leadingIcon: undefined, trailingIcon: "arrow-right", size: "lg" } };

/** 아이콘 세트에 없는 그래픽을 좌측에 — design.pen 로그인 "Google로 계속하기" */
export const CustomLeadingVisual: Story = {
  args: {
    variant: "secondary",
    size: "lg",
    fullWidth: true,
    children: "Google로 계속하기",
    // eslint-disable-next-line @next/next/no-img-element
    leadingIcon: <img src="/images/google-g.svg" alt="" width={20} height={20} />,
  },
  decorators: [(Story) => <div className="w-[328px]"><Story /></div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Google로 계속하기" }).querySelector("img")).not.toBeNull();
  },
};
