import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text } from "../../components/typography/Text";
import { FoundationHeader } from "./FoundationHeader";
import { colorScales, colorSteps, contrastRatio, readToken } from "./tokens";

// design.pen "Color Foundation · 시안 추출 팔레트": 색상별 1행, 프리미티브 토큰 1개당 정사각형 1개.
// 대비율은 화면 배경(background-default = neutral-0) 기준, 3:1 이상 / 4.5:1 이상이면 태그 표시.

function ContrastTag({ ratio }: { ratio: number }) {
  if (ratio >= 4.5)
    return (
      <span className="rounded-lg bg-[var(--color-neutral-950)] px-[5px] py-[3px] text-[9px] font-bold text-white">
        4.5+
      </span>
    );
  if (ratio >= 3)
    return (
      <span className="rounded-lg bg-[var(--color-neutral-50)] px-[5px] py-[3px] text-[9px] font-bold text-[var(--color-neutral-900)]">
        3+
      </span>
    );
  return null;
}

function PaletteCell({ token }: { token: string }) {
  const step = token.split("-").pop();
  const ratio = contrastRatio(readToken(token), readToken("color-neutral-0"));
  return (
    <div className="flex w-[92px] flex-col items-center gap-[7px]">
      <div
        data-testid={token}
        title={`${token} · ${readToken(token)}`}
        className="flex size-[76px] flex-col items-center justify-end rounded-[10px] border border-[var(--color-border-default)] p-[7px]"
        style={{ background: `var(--${token})` }}
      >
        <ContrastTag ratio={ratio} />
      </div>
      <span className="text-[11px] font-semibold text-[var(--color-text-subtle)]">{step}</span>
      <span className="text-[9px] text-[var(--color-text-disabled)]">{ratio.toFixed(1)}:1</span>
    </div>
  );
}

function ColorPalette() {
  return (
    <div className="flex w-[1440px] flex-col gap-7 bg-[var(--color-background-default)] px-12 pt-12 pb-[52px]">
      <FoundationHeader
        eyebrow="FOUNDATION / COLOR"
        title="Food Community Color System"
        description="3개 시안에서 추출한 화덕 오렌지, 웜 뉴트럴, 라임·그린·레드와 조화로운 인포 틸을 11단계 접근성 팔레트로 확장했습니다."
        aside={
          <div className="flex flex-col items-end gap-2">
            <Text variant="label-md" className="font-semibold text-[var(--color-text-subtle)]">
              neutral-0(흰) 배경 대비
            </Text>
            <div className="flex gap-2">
              <span className="rounded-[14px] bg-[var(--color-neutral-700)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--color-neutral-50)]">
                3:1+
              </span>
              <span className="rounded-[14px] bg-[var(--color-neutral-900)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--color-neutral-50)]">
                4.5:1+
              </span>
            </div>
          </div>
        }
      />

      <div className="flex flex-col gap-[22px]">
        {colorScales.map(({ scale, role, label }) => (
          <div key={scale} className="flex gap-4" aria-label={`${role} palette`}>
            <div className="flex w-[150px] flex-col gap-1 py-2">
              <span className="text-[11px] font-bold tracking-[0.1em] text-[var(--color-text-brand)]">{role}</span>
              <Text variant="label-lg">{label}</Text>
            </div>
            {colorSteps.map((step) => (
              <PaletteCell key={step} token={`color-${scale}-${step}`} />
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-[18px]">
        <Text variant="label-md" className="text-[var(--color-text-subtle)]">
          Source · 01 메인 / 02 상세 / 03 등록 오류
        </Text>
        <Text variant="label-md" className="font-semibold">
          66 primitive · 37 semantic tokens
        </Text>
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Color Palette",
  component: ColorPalette,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ColorPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {
  play: async ({ canvas }) => {
    // CssCheck: tokens.css가 로드되어 brand-500(#FF5A1F)이 실제로 칠해졌는지 확인
    await expect(getComputedStyle(canvas.getByTestId("color-brand-500")).backgroundColor).toBe("rgb(255, 90, 31)");
    // 6개 스케일 × 11단계
    await expect(canvas.getAllByTitle(/^color-/)).toHaveLength(66);
  },
};
