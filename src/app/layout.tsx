import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dining Plus",
  description: "Better hospitality through trusted, two-sided ratings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
