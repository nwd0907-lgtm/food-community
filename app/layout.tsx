import type { Metadata } from "next";
import { pretendard } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FOOOD", template: "%s · FOOOD" },
  description: "이웃이 직접 발견한 동네 맛집",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="font-pretendard min-h-full flex flex-col">{children}</body>
    </html>
  );
}
