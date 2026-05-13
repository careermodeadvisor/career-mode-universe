import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Squad IQ",
  description: "FC Career Mode squad management tool",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
