import Link from "next/link";

import { Brand } from "./brand";

export function DarkHeader({
  backHref,
  backLabel,
  children,
}: Readonly<{
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}>) {
  return (
    <div className="bg-[var(--night)] text-white">
      <header className="ui-container flex min-h-20 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center text-sm font-bold text-white/80 transition hover:text-white"
          >
            ← {backLabel}
          </Link>
        ) : (
          <Brand inverse />
        )}
        {children}
      </header>
    </div>
  );
}
