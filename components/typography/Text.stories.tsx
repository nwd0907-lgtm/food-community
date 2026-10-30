import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text, textVariants, type TextVariant } from "./Text";

// design.pen "Typography Foundation · Pretendard" 의 샘플 문구
const samples: Record<TextVariant, string> = {
  "display-lg": "Display Large · 함께 만드는 맛있는 동네",
  "display-md": "Display Medium · 오늘의 식탁을 발견하세요",
  "display-sm": "Display Small · 이웃과 나누는 한 끼",
  "heading-lg": "Heading Large · 오후의 화덕",
  "heading-md": "Heading Medium · 지금 가장 사랑받는 곳",
  "heading-sm": "Heading Small · 새로운 모임을 열어보세요",
  "body-lg": "Body Large · 좋은 음식은 사람을 모으고, 이야기는 오래 남습니다.",
  "body-md": "Body Medium · 가까운 이웃과 취향을 나누는 푸드 커뮤니티.",
  "label-lg": "Label Large · 인기 모임",
  "label-md": "Label Medium · 저장하기",
};

const specs: Record<TextVariant, string> = {
  "display-lg": "font-size-800 · bold · tight",
  "display-md": "font-size-700 · bold · tight",
  "display-sm": "font-size-600 · bold · tight",
  "heading-lg": "font-size-500 · bold · tight",
  "heading-md": "font-size-400 · bold · tight",
  "heading-sm": "font-size-300 · semibold · tight",
  "body-lg": "font-size-300 · regular · normal",
  "body-md": "font-size-200 · regular · normal",
  "label-lg": "font-size-200 · semibold · normal",
  "label-md": "font-size-100 · regular · normal",
};

const meta = {
  title: "Foundations/Typography",
  component: Text,
  args: { variant: "body-lg", children: samples["body-lg"] },
  argTypes: {
    variant: { control: "select", options: textVariants },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 구조별 1행 — 디자인 프레임 재현 */
export const Scale: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex w-[1100px] flex-col bg-[var(--color-background-default)] p-12">
      {textVariants.map((variant) => (
        <div
          key={variant}
          className="flex min-h-[56px] items-center gap-[var(--spacing-24)] border-b border-[var(--color-border-default)] px-2 py-[var(--spacing-16)]"
        >
          <div className="flex w-[240px] shrink-0 flex-col gap-0.5 whitespace-nowrap">
            <span className="font-mono text-[13px] font-semibold text-[var(--color-text-default)]">{variant}</span>
            <span className="font-mono text-[11px] text-[var(--color-text-subtle)]">{specs[variant]}</span>
          </div>
          <Text variant={variant} className="flex-1">
            {samples[variant]}
          </Text>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    // display-lg: 36px · 700 · 행간 1.2 · 자간 -2%(= -0.72px), Pretendard 적용 확인
    const el = getComputedStyle(canvas.getByText(samples["display-lg"]));
    await expect(el.fontSize).toBe("36px");
    await expect(el.fontWeight).toBe("700");
    await expect(el.lineHeight).toBe("43.2px");
    await expect(el.letterSpacing).toBe("-0.72px");
    await expect(el.fontFamily).toMatch(/pretendard/i);
  },
};

export const Playground: Story = {};

export const DisplayLarge: Story = { args: { variant: "display-lg", children: samples["display-lg"] } };
export const HeadingMedium: Story = { args: { variant: "heading-md", children: samples["heading-md"] } };
export const BodyMedium: Story = { args: { variant: "body-md", children: samples["body-md"] } };
export const LabelLarge: Story = { args: { variant: "label-lg", children: samples["label-lg"] } };
