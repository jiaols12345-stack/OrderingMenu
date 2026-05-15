import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "云巷小厨点餐",
  description: "云巷小厨点餐界面"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
