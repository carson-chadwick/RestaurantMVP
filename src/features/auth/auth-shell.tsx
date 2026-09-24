import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase"
        >
          Dining Plus
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        <p className="mt-2 leading-7 text-stone-600">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
