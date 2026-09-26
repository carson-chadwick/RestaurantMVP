import Link from "next/link";

import { DarkHeader } from "@/components/dark-header";
import { PublicAccountNavigation } from "@/features/auth/public-account-navigation";
import {
  RestaurantCard,
  RestaurantPagination,
} from "@/features/restaurants/discovery-components";
import {
  listPublicRestaurants,
  normalizeRestaurantPage,
  normalizeRestaurantSearch,
} from "@/features/restaurants/public-data";

type RestaurantDirectoryPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

export default async function RestaurantDirectoryPage({
  searchParams,
}: Readonly<RestaurantDirectoryPageProps>) {
  const [parameters, accountNavigation] = await Promise.all([
    searchParams,
    PublicAccountNavigation({ compact: true, inverse: true }),
  ]);
  const search = normalizeRestaurantSearch(parameters.q);
  const page = normalizeRestaurantPage(parameters.page);

  let result;
  try {
    result = await listPublicRestaurants(search, page);
  } catch {
    return (
      <DirectoryShell accountNavigation={accountNavigation}>
        <div role="alert" className="ui-status-error">
          <p>We couldn&apos;t load restaurants.</p>
          <Link
            href="/restaurants"
            className="mt-3 inline-block font-semibold underline"
          >
            Try again
          </Link>
        </div>
      </DirectoryShell>
    );
  }

  return (
    <DirectoryShell accountNavigation={accountNavigation}>
      <form
        action="/restaurants"
        method="get"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="restaurant-search" className="sr-only">
          Search restaurants by name
        </label>
        <input
          id="restaurant-search"
          name="q"
          type="search"
          defaultValue={search}
          maxLength={100}
          placeholder="Search by restaurant name"
          className="ui-field min-w-0 flex-1"
        />
        <button type="submit" className="ui-button-primary">
          Search
        </button>
      </form>

      {result.restaurants.length ? (
        <>
          <p className="mt-6 text-sm text-stone-500">
            {result.totalCount}{" "}
            {result.totalCount === 1 ? "restaurant" : "restaurants"}
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {result.restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
          <RestaurantPagination
            page={page}
            search={search}
            totalCount={result.totalCount}
          />
        </>
      ) : (
        <div className="ui-card mt-8 p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            {page > 1
              ? "No restaurants on this page"
              : search
                ? "No matching restaurants"
                : "No restaurants yet"}
          </h2>
          <p className="mt-2 text-stone-600">
            {page > 1
              ? "Return to an earlier page to continue browsing."
              : search
                ? `No restaurants match “${search}”. Try another name.`
                : "Restaurant listings will appear here as owners create them."}
          </p>
          {page > 1 ? (
            <div className="mt-5">
              <RestaurantPagination
                page={page}
                search={search}
                totalCount={0}
              />
            </div>
          ) : null}
        </div>
      )}
    </DirectoryShell>
  );
}

function DirectoryShell({
  accountNavigation,
  children,
}: Readonly<{
  accountNavigation: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <DarkHeader>{accountNavigation}</DarkHeader>
      <div className="ui-container">
        <section className="py-14 sm:py-20">
          <p className="ui-eyebrow">Restaurant directory</p>
          <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
            Find a restaurant
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
            Browse restaurant profiles and customer rating summaries.
          </p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
