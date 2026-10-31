import {
  CustomerRatingSummaryDisplay,
  CustomerReviewEditor,
  RestaurantRatingForm,
} from "@/features/visits/components";
import {
  loadCustomerContributionCount,
  loadCustomerReputation,
  loadCustomerVisits,
} from "@/features/visits/data";

const BADGES = [
  { count: 1, name: "First Taste" },
  { count: 5, name: "Table Scout" },
  { count: 10, name: "Dining Guide" },
  { count: 25, name: "Local Expert" },
] as const;

export default async function CustomerActivityPage() {
  let visits;
  let reputation;
  let contributionCount;
  try {
    [visits, reputation, contributionCount] = await Promise.all([
      loadCustomerVisits(),
      loadCustomerReputation(),
      loadCustomerContributionCount(),
    ]);
  } catch {
    visits = null;
    reputation = null;
    contributionCount = null;
  }

  const pendingVisits = visits?.filter((visit) => visit.stars === null) ?? [];
  const ratedVisits = visits?.filter((visit) => visit.stars !== null) ?? [];

  return (
    <main className="min-h-screen">
      <div className="ui-container max-w-5xl">
        <section className="py-14 sm:py-20">
          <p className="ui-eyebrow">Your activity</p>
          <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
            Reviews and progress.
          </h1>
          {visits === null ||
          reputation === null ||
          contributionCount === null ? (
            <div role="alert" className="ui-status-error mt-10">
              We couldn&apos;t load your activity. Please try again.
            </div>
          ) : (
            <>
              <section className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="ui-card p-6 sm:p-8">
                  <h2 className="text-2xl font-semibold text-stone-900">
                    Your progress
                  </h2>
                  <p className="mt-2 text-stone-600">
                    {contributionCount * 10} points from {contributionCount}{" "}
                    active {contributionCount === 1 ? "review" : "reviews"}.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {BADGES.map((badge) => {
                      const earned = contributionCount >= badge.count;
                      return (
                        <div
                          key={badge.count}
                          className={`rounded-xl border p-3 ${
                            earned
                              ? "border-[var(--cognac)] bg-[var(--cognac-soft)]"
                              : "border-[var(--line)] bg-stone-50 text-stone-500"
                          }`}
                        >
                          <p className="font-semibold">{badge.name}</p>
                          <p className="mt-1 text-xs">
                            {earned ? "Earned" : `${badge.count} reviews`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="ui-card p-6 sm:p-8">
                  <h2 className="text-2xl font-semibold text-stone-900">
                    Your customer rating
                  </h2>
                  <p className="mt-2 text-stone-600">
                    Private to you and authorized restaurant staff.
                  </p>
                  <div className="mt-4">
                    <CustomerRatingSummaryDisplay {...reputation.summary} />
                  </div>
                </div>
              </section>

              <section className="mt-12">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Pending reviews ({pendingVisits.length})
                </h2>
                <div className="mt-4 space-y-4">
                  {pendingVisits.map((visit) => (
                    <article key={visit.visitId} className="ui-card p-6">
                      <h3 className="text-lg font-semibold text-stone-900">
                        {visit.restaurantName}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Visit added by restaurant staff on{" "}
                        {new Date(visit.recordedAt).toLocaleString("en-US")}
                      </p>
                      <RestaurantRatingForm visit={visit} />
                    </article>
                  ))}
                  {!pendingVisits.length ? (
                    <p className="ui-status-empty">
                      You have no visits waiting for a review.
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="mt-12">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Your restaurant reviews
                </h2>
                <div className="mt-4 space-y-3">
                  {ratedVisits.map((visit) => (
                    <article key={visit.visitId} className="ui-card p-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
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
                      </div>
                      {visit.reviewText ? (
                        <p className="mt-4 whitespace-pre-wrap text-stone-700">
                          {visit.reviewText}
                        </p>
                      ) : null}
                      <CustomerReviewEditor visit={visit} />
                    </article>
                  ))}
                  {!ratedVisits.length ? (
                    <p className="ui-status-empty">No reviews yet.</p>
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
                    <p className="ui-status-empty">
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
