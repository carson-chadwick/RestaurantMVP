import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">
          Dining Plus
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
          Better hospitality starts with trust.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-stone-600">
          A two-sided reputation platform helping restaurants and customers
          build better dining experiences together.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-stone-700"
          >
            Create customer account
          </Link>
          <Link
            href="/restaurant/signup"
            className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-800 hover:bg-stone-50"
          >
            Create restaurant account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-800 hover:bg-stone-50"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
