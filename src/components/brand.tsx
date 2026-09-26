import Link from "next/link";

export function Brand({
  inverse = false,
  className = "",
}: Readonly<{ inverse?: boolean; className?: string }>) {
  return (
    <Link
      href="/"
      aria-label="Dining Plus home"
      className={`inline-flex min-h-11 items-center font-sans text-xl font-bold tracking-[-0.04em] ${
        inverse ? "text-white" : "text-[var(--ink)]"
      } ${className}`}
    >
      dining<span className="text-[var(--cognac-bright)]">+</span>
    </Link>
  );
}
