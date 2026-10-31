import Link from "next/link";

import {
  RestaurantCard,
  RestaurantPagination,
} from "@/features/restaurants/discovery-components";
import {
  listPublicRestaurants,
  normalizeRestaurantPage,
  normalizeRestaurantSearch,
} from "@/features/restaurants/public-data";

type CustomerHomeProps = {
  searchParams?: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

export default async function CustomerPage({
  searchParams = Promise.resolve({}),
}: Readonly<CustomerHomeProps> = {}) {
  const parameters = await searchParams;
  const search = normalizeRestaurantSearch(parameters.q);
  const page = normalizeRestaurantPage(parameters.page);
  const directoryResult = await Promise.allSettled([
    listPublicRestaurants(search, page),
  ]).then(([result]) => result);

  return (
    <main className="min-h-screen">
      <div className="ui-container">
        <section className="py-14 sm:py-20">
          <p className="ui-eyebrow">Customer home</p>
          <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
            Find your next table.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
            Explore restaurants, compare ratings, and read experiences from
            other customers.
          </p>
          <form
            action="/customer"
            method="get"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
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

          {directoryResult.status === "rejected" ? (
            <div role="alert" className="ui-status-error mt-8">
              <p>We couldn&apos;t load restaurants.</p>
              <Link
                href="/customer"
                className="mt-3 inline-block font-semibold underline"
              >
                Try again
              </Link>
            </div>
          ) : directoryResult.value.restaurants.length ? (
            <>
              <p className="mt-6 text-sm text-stone-500">
                {directoryResult.value.totalCount}{" "}
                {directoryResult.value.totalCount === 1
                  ? "restaurant"
                  : "restaurants"}
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {directoryResult.value.restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
              <RestaurantPagination
                page={page}
                search={search}
                totalCount={directoryResult.value.totalCount}
                basePath="/customer"
              />
            </>
          ) : (
            <div className="ui-status-empty mt-8">
              {search
                ? `No restaurants match “${search}”.`
                : "No restaurants are available yet."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
