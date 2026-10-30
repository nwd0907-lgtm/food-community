import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ListItem } from "./ListItem";

// design.pen 10 장소 검색 · NAVER API 결과
const results = [
  ["오후의 화덕", "서울 성동구 성수이로24길 38"],
  ["오후의 화덕 성수점", "서울 성동구 연무장길 41"],
  ["성수 화덕피자", "서울 성동구 아차산로7길 15"],
  ["화덕과 밀", "서울 성동구 상원12길 20"],
];

const meta = {
  title: "Components/Etc/ListItem",
  component: ListItem,
  args: { icon: "search", title: results[0][0], description: results[0][1], onClick: fn() },
  decorators: [(Story) => <div className="w-[328px]"><Story /></div>],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /오후의 화덕/ }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const TitleOnly: Story = { args: { description: undefined } };

/** 검색 결과 목록: 마지막 행은 구분선 없음 */
export const List: Story = {
  render: (args) => (
    <ul className="flex flex-col divide-y divide-[var(--color-border-default)]">
      {results.map(([title, description]) => (
        <li key={title}>
          <ListItem {...args} title={title} description={description} />
        </li>
      ))}
    </ul>
  ),
};
