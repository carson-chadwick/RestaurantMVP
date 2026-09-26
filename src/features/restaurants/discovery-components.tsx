import Link from "next/link";

import type { RestaurantProfile } from "./profile";
import { RatingSummaryDisplay } from "./profile-components";
import { RESTAURANTS_PER_PAGE } from "./public-data";

function directoryHref(search: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/restaurants?${query}` : "/restaurants";
}

export function RestaurantCard({
  restaurant,
}: Readonly<{ restaurant: RestaurantProfile }>) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-stone-900">
        <Link
          href={`/restaurants/${restaurant.id}`}
          className="hover:text-amber-700"
        >
          {restaurant.name}
        </Link>
      </h2>
      {restaurant.address ? (
        <p className="mt-2 text-sm text-stone-500">{restaurant.address}</p>
      ) : null}
      {restaurant.description ? (
        <p className="mt-4 line-clamp-3 leading-7 text-stone-600">
          {restaurant.description}
        </p>
      ) : null}
      <div className="mt-auto pt-6">
        <RatingSummaryDisplay {...restaurant.ratingSummary} />
      </div>
    </article>
  );
}

export function RestaurantPagination({
  page,
  search,
  totalCount,
}: Readonly<{ page: number; search: string; totalCount: number }>) {
  const hasPrevious = page > 1;
  const hasNext = page * RESTAURANTS_PER_PAGE < totalCount;
  if (!hasPrevious && !hasNext) return null;

  return (
    <nav
      aria-label="Restaurant result pages"
      className="mt-10 flex justify-between"
    >
      {hasPrevious ? (
        <Link
          href={directoryHref(search, page - 1)}
          className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-50"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      {hasNext ? (
        <Link
          href={directoryHref(search, page + 1)}
          className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-50"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
