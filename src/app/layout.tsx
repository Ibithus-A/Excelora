import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Excelora",
  description: "A clean note app inspired by Notion and RemNote",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
