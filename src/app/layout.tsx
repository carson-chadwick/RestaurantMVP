import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import { Brand } from "@/components/brand";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dining Plus",
  description: "Better hospitality through trusted, two-sided ratings.",
};

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${sans.variable} flex min-h-screen flex-col`}
      >
        <div className="flex-1">{children}</div>
        <footer className="border-t border-[var(--line)] bg-white px-6 py-7">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <Brand className="text-lg" />
            <p className="text-xs text-[var(--ink-muted)]">
              Better hospitality through two-sided reputation. ·{" "}
              <Link
                href="/privacy"
                className="hover:text-[var(--ink)] hover:underline"
              >
                Privacy policy
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
