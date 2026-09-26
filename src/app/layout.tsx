import type { Metadata } from "next";
import Link from "next/link";

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
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-stone-200 px-6 py-4 text-center text-xs text-stone-500">
          <Link
            href="/privacy"
            className="hover:text-stone-800 hover:underline"
          >
            Privacy policy
          </Link>
        </footer>
      </body>
    </html>
  );
}
