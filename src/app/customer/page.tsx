import Link from "next/link";
import { redirect } from "next/navigation";

import { DarkHeader } from "@/components/dark-header";
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
    <main className="min-h-screen">
      <DarkHeader>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Link href="/restaurants" className="ui-button-inverse">
            Browse restaurants
          </Link>
          <Link href="/customer/profile" className="ui-button-inverse">
            Profile
          </Link>
          <form action={logout}>
            <button type="submit" className="ui-button-inverse">
              Sign out
            </button>
          </form>
        </div>
      </DarkHeader>
      <div className="ui-container max-w-5xl">
        <section className="py-16">
          <p className="ui-eyebrow">Customer home</p>
          <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
            Welcome, {profile.first_name}.
          </h1>
          <p className="mt-5 text-lg text-stone-600">
            Signed in as {userData.user.email}
          </p>
          {visits === null || reputation === null ? (
            <div role="alert" className="ui-status-error mt-10">
              <p>We couldn&apos;t load your restaurant visits.</p>
              <Link
                href="/customer"
                className="mt-3 inline-block font-semibold underline"
              >
                Try again
              </Link>
            </div>
          ) : (
            <>
              <section className="ui-card mt-10 p-6 sm:p-8">
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
                    <article key={visit.visitId} className="ui-card p-6">
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
                    <p className="ui-status-empty">
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
                      className="ui-card flex flex-col justify-between gap-4 p-5 sm:flex-row"
                    >
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {visit.restaurantName}
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          {new Date(visit.recordedAt).toLocaleString("en-US")}
                        </p>
                      </div>
                      <p className="font-semibold text-[var(--cognac)]">
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
                      className="ui-card flex flex-col justify-between gap-4 p-5 sm:flex-row"
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
                      <p className="font-semibold text-[var(--cognac)]">
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
