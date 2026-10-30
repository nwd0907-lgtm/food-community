import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { expect } from "storybook/test";
import { Text } from "../../components/typography/Text";
import { FoundationHeader } from "./FoundationHeader";
import {
  colorScales,
  colorSteps,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  readToken,
  semanticColors,
  spacingTokens,
} from "./tokens";

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[var(--spacing-16)]">
      <div className="flex flex-col gap-1">
        <Text variant="heading-lg" as="h2">
          {title}
        </Text>
        <Text variant="body-md" className="text-[var(--color-text-subtle)]">
          {description}
        </Text>
      </div>
      {children}
    </section>
  );
}

function TokenTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-[var(--color-border-strong)]">
          {head.map((h) => (
            <th key={h} className="py-2 pr-4">
              <Text variant="label-lg" className="text-[var(--color-text-subtle)]">
                {h}
              </Text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Cell({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <td className="border-b border-[var(--color-border-default)] py-2 pr-4 align-middle">
      <Text variant="body-md" as="span" className={mono ? "font-mono text-[12px] tracking-normal whitespace-nowrap" : ""}>
        {children}
      </Text>
    </td>
  );
}

function Swatch({ token }: { token: string }) {
  return (
    <span
      data-testid={`swatch-${token}`}
      className="inline-block size-6 rounded-md border border-[var(--color-border-default)] align-middle"
      style={{ background: `var(--${token})` }}
    />
  );
}

function DesignTokens() {
  return (
    <div className="flex min-w-[1280px] flex-col gap-[var(--spacing-32)] p-12">
      <FoundationHeader
        eyebrow="FOUNDATION / DESIGN TOKENS"
        title="Design Tokens"
        description="design.pen variables를 app/tokens.css의 CSS 변수로 옮겼습니다. 이름은 디자인 변수명과 동일하며, 시맨틱 토큰은 hex 없이 프리미티브 토큰만 참조합니다."
      />

      <Section title="Primitive · Color" description="역할별 6개 스케일 × 11단계 = 66개">
        <TokenTable head={["Token", ...colorSteps.map(String)]}>
          {colorScales.map(({ scale, role }) => (
            <tr key={scale}>
              <Cell mono>
                color-{scale}-* <span className="text-[var(--color-text-subtle)]">({role})</span>
              </Cell>
              {colorSteps.map((step) => (
                <td key={step} className="border-b border-[var(--color-border-default)] py-2 pr-2">
                  <div className="flex flex-col items-start gap-1">
                    <Swatch token={`color-${scale}-${step}`} />
                    <span className="font-mono text-[10px] text-[var(--color-text-subtle)]">
                      {readToken(`color-${scale}-${step}`)}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </TokenTable>
      </Section>

      <Section title="Semantic · Color" description="텍스트 · 배경 · 보더 용도별 토큰. 값은 프리미티브 토큰 참조(var())입니다.">
        <div className="grid grid-cols-3 gap-[var(--spacing-24)]">
          {Object.entries(semanticColors).map(([group, tokens]) => (
            <TokenTable key={group} head={[group, "references", ""]}>
              {tokens.map(([name, ref]) => (
                <tr key={name}>
                  <Cell mono>{name}</Cell>
                  <Cell mono>{ref}</Cell>
                  <td className="border-b border-[var(--color-border-default)] py-2">
                    <Swatch token={name} />
                  </td>
                </tr>
              ))}
            </TokenTable>
          ))}
        </div>
      </Section>

      <Section title="Primitive · Typography" description='font-family: "Pretendard Variable" · 사이즈 9단계 · 두께 3종 · 행간 2종'>
        <div className="grid grid-cols-3 gap-[var(--spacing-24)]">
          <TokenTable head={["font-size", "value"]}>
            {fontSizeTokens.map((t) => (
              <tr key={t}>
                <Cell mono>{t}</Cell>
                <Cell mono>{readToken(t)}</Cell>
              </tr>
            ))}
          </TokenTable>
          <TokenTable head={["font-weight", "value"]}>
            {fontWeightTokens.map((t) => (
              <tr key={t}>
                <Cell mono>{t}</Cell>
                <Cell mono>{readToken(t)}</Cell>
              </tr>
            ))}
          </TokenTable>
          <TokenTable head={["line-height", "value"]}>
            {lineHeightTokens.map((t) => (
              <tr key={t}>
                <Cell mono>{t}</Cell>
                <Cell mono>{readToken(t)}</Cell>
              </tr>
            ))}
          </TokenTable>
        </div>
      </Section>

      <Section title="Primitive · Spacing" description="토큰별 1행, 막대 길이 = 토큰 값">
        <TokenTable head={["token", "value", "preview", "usage"]}>
          {spacingTokens.map(({ name, usage }) => (
            <tr key={name}>
              <Cell mono>{name}</Cell>
              <Cell mono>{readToken(name)}</Cell>
              <td className="border-b border-[var(--color-border-default)] py-2 pr-4">
                <div
                  data-testid={`spacing-${name}`}
                  className="h-4 rounded-sm bg-[var(--color-background-brand-accent)]"
                  style={{ width: `var(--${name})` }}
                />
              </td>
              <Cell>{usage || "—"}</Cell>
            </tr>
          ))}
        </TokenTable>
      </Section>
    </div>
  );
}

const meta = {
  title: "Foundations/Design Tokens",
  component: DesignTokens,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DesignTokens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTokens: Story = {
  play: async ({ canvas }) => {
    // 시맨틱 토큰이 프리미티브 참조를 거쳐 실제 색으로 풀리는지 확인 (text-default → neutral-900 #171714)
    const swatch = canvas.getByTestId("swatch-color-text-default");
    await expect(getComputedStyle(swatch).backgroundColor).toBe("rgb(23, 23, 20)");
    await expect(getComputedStyle(canvas.getByTestId("spacing-spacing-24")).width).toBe("24px");
  },
};
