import Link from "next/link";

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
    PublicAccountNavigation({ compact: true }),
  ]);
  const search = normalizeRestaurantSearch(parameters.q);
  const page = normalizeRestaurantPage(parameters.page);

  let result;
  try {
    result = await listPublicRestaurants(search, page);
  } catch {
    return (
      <DirectoryShell accountNavigation={accountNavigation}>
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
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
          className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-stone-700"
        >
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
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8">
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
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase"
          >
            Dining Plus
          </Link>
          {accountNavigation}
        </header>
        <section className="py-12">
          <p className="text-sm font-semibold text-amber-700">
            Restaurant directory
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Find a restaurant
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
            Browse restaurant profiles and customer rating summaries.
          </p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
