import { PublicAccountNavigation } from "@/features/auth/public-account-navigation";

export default async function Home() {
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
        <div className="mt-10">
          {await PublicAccountNavigation({
            includeBrowse: true,
            includeSignupActions: true,
          })}
        </div>
      </section>
    </main>
  );
}
