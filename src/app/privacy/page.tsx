import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10">
      <article className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-12">
        <Link href="/" className="text-sm font-semibold text-amber-700">
          ← Dining Plus
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight text-stone-900">
          Privacy policy
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Last updated September 29, 2026
        </p>
        <div className="mt-8 space-y-7 leading-7 text-stone-700">
          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Information we use
            </h2>
            <p className="mt-2">
              Dining Plus stores account information, restaurant visit records,
              and ratings needed to provide its two-sided reputation service.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Restaurant access
            </h2>
            <p className="mt-2">
              Authorized restaurant owners and employees can see customer names
              and email addresses to identify customers and record paid visits.
              This access is not public.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-stone-900">Ratings</h2>
            <p className="mt-2">
              Restaurant rating averages and counts are public, but the
              customers behind those ratings are not. Customer reputation
              information is private to the customer and authorized restaurant
              staff.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-stone-900">
              Retention and security
            </h2>
            <p className="mt-2">
              Visit and rating records are retained to maintain rating history.
              Dining Plus limits sensitive reads and writes through
              authenticated, authorized server and database controls.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
