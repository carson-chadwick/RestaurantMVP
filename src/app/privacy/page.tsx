import { DarkHeader } from "@/components/dark-header";
import { PublicAccountNavigation } from "@/features/auth/public-account-navigation";

export default async function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <DarkHeader>
        {await PublicAccountNavigation({ compact: true, inverse: true })}
      </DarkHeader>
      <article className="ui-card ui-container my-10 max-w-3xl p-6 sm:my-14 sm:p-12">
        <p className="ui-eyebrow mt-10">How we handle information</p>
        <h1 className="mt-3 text-5xl text-[var(--ink)]">Privacy policy</h1>
        <p className="mt-3 text-sm text-stone-500">
          Last updated September 29, 2026
        </p>
        <div className="mt-10 space-y-9 leading-7 text-[var(--ink-soft)]">
          <section>
            <h2 className="text-2xl text-[var(--ink)]">Information we use</h2>
            <p className="mt-2">
              Dining Plus stores account information, restaurant visit records,
              and ratings needed to provide its two-sided reputation service.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)]">Restaurant access</h2>
            <p className="mt-2">
              Authorized restaurant owners and employees can see customer names
              and email addresses to identify customers and record paid visits.
              This access is not public.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)]">Ratings</h2>
            <p className="mt-2">
              Restaurant rating averages and counts are public, but the
              customers behind those ratings are not. Customer reputation
              information is private to the customer and authorized restaurant
              staff.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)]">
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
