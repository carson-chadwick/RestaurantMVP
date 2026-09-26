import Link from "next/link";

import { DarkHeader } from "@/components/dark-header";
import {
  CustomerRatingForm,
  CustomerRatingSummaryDisplay,
  RecordVisitControl,
} from "@/features/visits/components";
import {
  CUSTOMERS_PER_PAGE,
  loadStaffVisitWorkspace,
} from "@/features/visits/data";
import {
  customerSearchSchema,
  normalizeVisitPage,
} from "@/features/visits/validation";

type StaffVisitsPageProps = {
  searchParams: Promise<{
    firstName?: string | string[];
    lastName?: string | string[];
    page?: string | string[];
    ratingPage?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function visitsHref(
  firstName: string,
  lastName: string,
  page: number,
  ratingPage: number,
) {
  const params = new URLSearchParams();
  if (firstName && lastName) {
    params.set("firstName", firstName);
    params.set("lastName", lastName);
  }
  if (page > 1) params.set("page", String(page));
  if (ratingPage > 1) params.set("ratingPage", String(ratingPage));
  const query = params.toString();
  return query ? `/restaurant/visits?${query}` : "/restaurant/visits";
}

export default async function StaffVisitsPage({
  searchParams,
}: Readonly<StaffVisitsPageProps>) {
  const parameters = await searchParams;
  const searchResult = customerSearchSchema.safeParse({
    firstName: firstValue(parameters.firstName),
    lastName: firstValue(parameters.lastName),
  });
  const page = normalizeVisitPage(parameters.page);
  const ratingPage = normalizeVisitPage(parameters.ratingPage);
  const firstName = searchResult.success ? searchResult.data.firstName : "";
  const lastName = searchResult.success ? searchResult.data.lastName : "";

  let workspace;
  try {
    workspace = await loadStaffVisitWorkspace(
      firstName,
      lastName,
      page,
      ratingPage,
    );
  } catch {
    return (
      <VisitsShell>
        <div role="alert" className="ui-status-error">
          <p>We couldn&apos;t load visit tools.</p>
          <Link
            href="/restaurant/visits"
            className="mt-3 inline-block font-semibold underline"
          >
            Try again
          </Link>
        </div>
      </VisitsShell>
    );
  }

  const hasPrevious = page > 1;
  const hasNext = page * CUSTOMERS_PER_PAGE < workspace.totalCount;
  const hasPreviousRatingPage = ratingPage > 1;
  const hasNextRatingPage =
    ratingPage * CUSTOMERS_PER_PAGE < workspace.ratingQueueTotalCount;

  return (
    <VisitsShell>
      <section>
        <p className="ui-eyebrow">Guest directory</p>
        <h1 className="mt-3 text-5xl text-[var(--ink)]">Record a paid visit</h1>
        <p className="mt-2 text-stone-600">
          Select a recent customer or search an exact first and last name.
        </p>
        <form
          action="/restaurant/visits"
          method="get"
          className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <label className="text-sm font-medium text-stone-700">
            First name
            <input
              name="firstName"
              defaultValue={firstValue(parameters.firstName)}
              maxLength={50}
              className="ui-field mt-1"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Last name
            <input
              name="lastName"
              defaultValue={firstValue(parameters.lastName)}
              maxLength={50}
              className="ui-field mt-1"
            />
          </label>
          <button type="submit" className="ui-button-primary self-end">
            Search
          </button>
        </form>
        {!searchResult.success ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            Enter both first and last name to search.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {workspace.customers.map((customer) => (
            <article key={customer.userId} className="ui-card p-5">
              <h2 className="font-semibold text-stone-900">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="mt-1 text-sm break-all text-stone-500">
                {customer.email}
              </p>
              <div className="mt-3">
                <CustomerRatingSummaryDisplay {...customer} />
              </div>
              <RecordVisitControl customer={customer} />
            </article>
          ))}
        </div>
        {!workspace.customers.length ? (
          <p className="ui-status-empty mt-6">
            {firstName
              ? "No customers match that exact name."
              : "No customers are available."}
          </p>
        ) : null}
        {hasPrevious || hasNext ? (
          <nav
            aria-label="Customer pages"
            className="mt-6 flex justify-between"
          >
            {hasPrevious ? (
              <Link
                href={visitsHref(firstName, lastName, page - 1, ratingPage)}
                className="ui-button-quiet"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            {hasNext ? (
              <Link
                href={visitsHref(firstName, lastName, page + 1, ratingPage)}
                className="ui-button-quiet"
              >
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>

      <section className="mt-14 border-t border-stone-200 pt-10">
        <h2 className="text-2xl font-semibold text-stone-900">
          Customers ready to rate
        </h2>
        <p className="mt-2 text-stone-600">
          These customers have rated your restaurant for the listed visit.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {workspace.ratingQueue.map((visit) => (
            <article key={visit.visitId} className="ui-card p-5">
              <h3 className="font-semibold text-stone-900">
                {visit.firstName} {visit.lastName}
              </h3>
              <p className="mt-1 text-sm break-words text-stone-500">
                {visit.email} · Visit{" "}
                {new Date(visit.recordedAt).toLocaleString("en-US")}
              </p>
              <div className="mt-3">
                <CustomerRatingSummaryDisplay {...visit} />
              </div>
              <CustomerRatingForm visit={visit} />
            </article>
          ))}
          {!workspace.ratingQueue.length ? (
            <p className="text-stone-600">
              No customers are waiting for a rating.
            </p>
          ) : null}
        </div>
        {hasPreviousRatingPage || hasNextRatingPage ? (
          <nav
            aria-label="Customer rating pages"
            className="mt-6 flex justify-between"
          >
            {hasPreviousRatingPage ? (
              <Link
                href={visitsHref(firstName, lastName, page, ratingPage - 1)}
                className="ui-button-quiet"
              >
                Previous ratings
              </Link>
            ) : (
              <span />
            )}
            {hasNextRatingPage ? (
              <Link
                href={visitsHref(firstName, lastName, page, ratingPage + 1)}
                className="ui-button-quiet"
              >
                Next ratings
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>

      <section className="mt-14 border-t border-stone-200 pt-10">
        <h2 className="text-2xl font-semibold text-stone-900">Recent visits</h2>
        <div className="mt-5 space-y-3">
          {workspace.recentVisits.map((visit) => (
            <article
              key={visit.visitId}
              className="ui-card flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold text-stone-900">
                  {visit.firstName} {visit.lastName}
                </p>
                <p className="text-sm break-words text-stone-500">
                  {visit.email} ·{" "}
                  {new Date(visit.recordedAt).toLocaleString("en-US")}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${visit.ratingStatus === "customer_rated" ? "text-green-700" : "text-amber-700"}`}
              >
                {visit.ratingStatus === "awaiting_customer_rating"
                  ? "Awaiting customer rating"
                  : visit.ratingStatus === "ready_to_rate_customer"
                    ? "Ready to rate customer"
                    : "Customer rated"}
              </p>
            </article>
          ))}
          {!workspace.recentVisits.length ? (
            <p className="text-stone-600">No visits recorded yet.</p>
          ) : null}
        </div>
      </section>
    </VisitsShell>
  );
}

function VisitsShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen">
      <DarkHeader backHref="/restaurant" backLabel="Restaurant portal" />
      <div className="ui-container max-w-5xl py-10 sm:py-14">
        <div>{children}</div>
      </div>
    </main>
  );
}
