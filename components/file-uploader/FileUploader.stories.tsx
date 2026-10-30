import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { Matrix, Page, Section } from "../../stories/helpers/Matrix";
import { FileItem, FileUploader, type UploadFile } from "./FileUploader";

const complete: UploadFile = { id: "1", name: "restaurant-photo.jpg", status: "complete" };
const uploading: UploadFile = { id: "2", name: "restaurant-photo.jpg", status: "uploading", statusText: "업로드 중 · 68%" };
const failed: UploadFile = { id: "3", name: "restaurant-photo.jpg", status: "error", statusText: "파일 용량을 확인해 주세요." };

const meta = {
  title: "Components/Forms/FileUploader",
  component: FileUploader,
  args: { helperText: "JPG, PNG · 최대 10MB", accept: "image/png,image/jpeg", files: [complete], onFilesSelected: fn(), onRemove: fn() },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 디자인 프레임 재현: 드롭존 상태(열) + 파일 아이템 상태 */
export const Overview: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
  render: () => (
    <Page>
      <Section title="dropzone">
        <Matrix
          columns={["default", "dragover", "disabled", "error"]}
          rows={[
            {
              label: "",
              cells: [
                <FileUploader key="d" helperText="JPG, PNG · 최대 10MB" files={[complete]} />,
                <FileUploader key="o" helperText="JPG, PNG · 최대 10MB" files={[uploading]} dragOver />,
                <FileUploader key="x" helperText="JPG, PNG · 최대 10MB" files={[complete]} disabled />,
                <FileUploader key="e" helperText="JPG, PNG · 최대 10MB" files={[failed]} errorMessage="파일을 다시 확인해 주세요" />,
              ],
            },
          ]}
          cellWidth={300}
        />
      </Section>
      <Section title="file item">
        <Matrix
          columns={["uploading", "complete", "error"]}
          rows={[
            {
              label: "",
              cells: [uploading, complete, failed].map((file) => (
                <ul key={file.id}>
                  <FileItem file={file} />
                </ul>
              )),
            },
          ]}
          cellWidth={300}
        />
      </Section>
    </Page>
  ),
};

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "restaurant-photo.jpg 삭제" }));
    await expect(args.onRemove).toHaveBeenCalledWith("1");
  },
};

/** 실제 파일 선택 → 업로드 중 → 완료 흐름 */
export const Interactive: Story = {
  render: (args) => {
    function Demo() {
      const [files, setFiles] = useState<UploadFile[]>([]);
      return (
        <FileUploader
          {...args}
          multiple
          files={files}
          onFilesSelected={(selected) => {
            const added = selected.map((f) => ({ id: `${f.name}-${Date.now()}`, name: f.name, status: "uploading" as const }));
            setFiles((prev) => [...prev, ...added]);
            setTimeout(
              () => setFiles((prev) => prev.map((f) => (added.some((a) => a.id === f.id) ? { ...f, status: "complete" } : f))),
              800,
            );
            args.onFilesSelected?.(selected);
          }}
          onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
        />
      );
    }
    return <Demo />;
  },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, new File(["x"], "menu.png", { type: "image/png" }));
    await expect(args.onFilesSelected).toHaveBeenCalled();
    await expect(await canvas.findByText("업로드 완료", {}, { timeout: 2000 })).toBeVisible();
  },
};

export const DragOver: Story = { args: { dragOver: true, files: [uploading] } };
export const Disabled: Story = { args: { disabled: true } };
export const ErrorState: Story = { args: { errorMessage: "파일을 다시 확인해 주세요", files: [failed] } };

/** 드롭존 문구 대체 — design.pen 맛집 등록 "(2/5)" */
export const CustomMessage: Story = {
  args: { helperText: undefined, message: "사진을 끌어오거나 직접 선택하세요. (1/5)" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("사진을 끌어오거나 직접 선택하세요. (1/5)")).toBeVisible();
  },
};
