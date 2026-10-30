import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text } from "../typography/Text";
import { Icon, iconNames, iconSizes, type IconName } from "./Icon";

// design.pen "Iconography Foundation · Lucide": 컬럼당 20행, 행마다 16 · 20 · 24 · 32 사이즈
const ROWS_PER_COLUMN = 20;
const columns: IconName[][] = [];
for (let i = 0; i < iconNames.length; i += ROWS_PER_COLUMN) {
  columns.push(iconNames.slice(i, i + ROWS_PER_COLUMN));
}

function SizeSlots({ name }: { name: IconName }) {
  return (
    <div className="flex items-center gap-11">
      {iconSizes.map((size) => (
        <span key={size} className="flex size-8 items-center justify-center" data-testid={`icon/${name}/${size}`}>
          <Icon name={name} size={size} />
        </span>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundations/Iconography",
  component: Icon,
  args: { name: "heart", size: 24 },
  argTypes: {
    name: { control: "select", options: iconNames },
    size: { control: "inline-radio", options: iconSizes },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 전체 아이콘 × 4개 사이즈 — 디자인 프레임 재현 */
export const Library: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex w-[2112px] flex-col gap-[var(--spacing-24)] bg-[var(--color-background-default)] p-12">
      <header className="flex items-end justify-between border-b border-[var(--color-border-default)] pb-[var(--spacing-24)]">
        <div className="flex max-w-[880px] flex-col gap-2">
          <Text variant="label-md" className="font-semibold tracking-[0.1em] text-[var(--color-text-brand)]">
            FOUNDATION · ICONOGRAPHY
          </Text>
          <Text variant="display-md">Lucide 아이콘 라이브러리</Text>
          <Text variant="body-md" className="text-[var(--color-text-subtle)]">
            제품 전반에서 사용하는 아이콘입니다. 각 아이콘은 16 · 20 · 24 · 32px 사이즈로 제공됩니다.
          </Text>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-lg font-bold text-[var(--color-text-default)]">
            {iconNames.length * iconSizes.length} COMPONENTS
          </span>
          <span className="text-xs font-medium text-[var(--color-text-subtle)]">
            Lucide · {iconNames.length} icons × {iconSizes.length} sizes
          </span>
        </div>
      </header>

      <div className="flex gap-12">
        {columns.map((column, i) => (
          <div key={i} className="flex flex-1 flex-col">
            <div className="flex h-6 items-center justify-between pr-5 pl-2">
              <Text variant="label-md" className="font-semibold text-[var(--color-text-muted)]">
                아이콘명
              </Text>
              <div className="flex items-center gap-11">
                {iconSizes.map((size) => (
                  <span key={size} className="w-8 text-center text-xs text-[var(--color-text-muted)]">
                    {size}
                  </span>
                ))}
              </div>
            </div>
            {column.map((name) => (
              <div
                key={name}
                className="flex h-[52px] items-center justify-between border-b border-[var(--color-border-default)] pr-5 pl-2"
              >
                <div className="flex w-[190px] flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-[var(--color-text-default)]">{name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">icon/{name}</span>
                </div>
                <SizeSlots name={name} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // 54종 × 4사이즈 = 216개 SVG, 32 사이즈는 실제 32px로 렌더
    await expect(canvasElement.querySelectorAll("svg.lucide")).toHaveLength(iconNames.length * iconSizes.length);
    const svg32 = canvasElement.querySelector('[data-testid="icon/arrow-left/32"] svg')!;
    await expect(svg32.getAttribute("width")).toBe("32");
  },
};

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      {iconSizes.map((size) => (
        <Icon key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  args: { name: "search", label: "검색" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "검색" })).toBeVisible();
  },
};
