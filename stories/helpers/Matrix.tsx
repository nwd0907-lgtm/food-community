import type { ReactNode } from "react";
import { Text } from "../../components/typography/Text";

// 디자인 프레임의 "타입(행) × 상태(열)" 정렬을 스토리에서 재현하는 표
type MatrixProps = {
  columns: string[];
  rows: { label: string; cells: ReactNode[] }[];
  /** 셀 최소 폭(px) */
  cellWidth?: number;
};

export function Matrix({ columns, rows, cellWidth = 200 }: MatrixProps) {
  return (
    <table className="border-separate border-spacing-x-6 border-spacing-y-4">
      <thead>
        <tr>
          <th />
          {columns.map((column) => (
            <th key={column} className="text-left">
              <Text variant="label-md" className="font-semibold tracking-[0.06em] text-[var(--color-text-subtle)] uppercase">
                {column}
              </Text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" className="pr-2 text-left align-middle">
              <Text variant="label-lg" className="whitespace-nowrap">
                {row.label}
              </Text>
            </th>
            {row.cells.map((cell, i) => (
              <td key={i} className="align-middle" style={{ minWidth: cellWidth }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 섹션 제목 + 내용 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <Text variant="heading-sm" as="h2" className="border-b border-[var(--color-border-default)] pb-2">
        {title}
      </Text>
      {children}
    </section>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-10 bg-[var(--color-background-default)] p-8">{children}</div>;
}
