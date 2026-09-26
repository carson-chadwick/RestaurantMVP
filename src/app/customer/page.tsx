import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/features/auth/actions";
import {
  CustomerRatingSummaryDisplay,
  RestaurantRatingForm,
} from "@/features/visits/components";
import {
  loadCustomerReputation,
  loadCustomerVisits,
} from "@/features/visits/data";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("customer_profiles")
    .select("first_name, last_name")
    .eq("user_id", userData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect("/login?error=profile");
  }

  let visits;
  let reputation;
  try {
    [visits, reputation] = await Promise.all([
      loadCustomerVisits(),
      loadCustomerReputation(),
    ]);
  } catch {
    visits = null;
    reputation = null;
  }

  const pendingVisits = visits?.filter((visit) => visit.stars === null) ?? [];
  const ratedVisits = visits?.filter((visit) => visit.stars !== null) ?? [];

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-6 border-b border-stone-200 pb-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase"
          >
            Dining Plus
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/restaurants"
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
            >
              Browse restaurants
            </Link>
            <Link
              href="/customer/profile"
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
            >
              Profile
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
        <section className="py-16">
          <p className="text-sm font-semibold text-amber-700">Customer home</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Welcome, {profile.first_name}.
          </h1>
          <p className="mt-5 text-lg text-stone-600">
            Signed in as {userData.user.email}
          </p>
          {visits === null || reputation === null ? (
            <div
              role="alert"
              className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
            >
              We couldn&apos;t load your restaurant visits. Please try again.
            </div>
          ) : (
            <>
              <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Your customer rating
                </h2>
                <p className="mt-2 text-stone-600">
                  This reputation is private to you and authorized restaurant
                  staff.
                </p>
                <div className="mt-4">
                  <CustomerRatingSummaryDisplay {...reputation.summary} />
                </div>
              </section>
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Pending ratings
                </h2>
                <div className="mt-4 space-y-4">
                  {pendingVisits.map((visit) => (
                    <article
                      key={visit.visitId}
                      className="rounded-2xl border border-stone-200 bg-white p-6"
                    >
                      <h3 className="text-lg font-semibold text-stone-900">
                        {visit.restaurantName}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Visit recorded{" "}
                        {new Date(visit.recordedAt).toLocaleString("en-US")}
                      </p>
                      <RestaurantRatingForm visit={visit} />
                    </article>
                  ))}
                  {!pendingVisits.length ? (
                    <p className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600">
                      You have no visits waiting for a rating.
                    </p>
                  ) : null}
                </div>
              </section>
              <section className="mt-12">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Recent rated visits
                </h2>
                <div className="mt-4 space-y-3">
                  {ratedVisits.map((visit) => (
                    <article
                      key={visit.visitId}
                      className="flex justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5"
                    >
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {visit.restaurantName}
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          {new Date(visit.recordedAt).toLocaleString("en-US")}
                        </p>
                      </div>
                      <p className="font-semibold text-amber-700">
                        {visit.stars} {visit.stars === 1 ? "star" : "stars"}
                      </p>
                    </article>
                  ))}
                  {!ratedVisits.length ? (
                    <p className="text-stone-600">No rated visits yet.</p>
                  ) : null}
                </div>
              </section>
              <section className="mt-12">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Ratings you received
                </h2>
                <div className="mt-4 space-y-3">
                  {reputation.history.map((rating) => (
                    <article
                      key={rating.visitId}
                      className="flex justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5"
                    >
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {rating.restaurantName}
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Visit{" "}
                          {new Date(rating.recordedAt).toLocaleString("en-US")}
                        </p>
                      </div>
                      <p className="font-semibold text-amber-700">
                        {rating.stars} {rating.stars === 1 ? "star" : "stars"}
                      </p>
                    </article>
                  ))}
                  {!reputation.history.length ? (
                    <p className="text-stone-600">
                      You haven&apos;t received any customer ratings yet.
                    </p>
                  ) : null}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
