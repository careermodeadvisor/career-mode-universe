import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Mode Universe",
  description: "Everything you need for a Career Mode",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
