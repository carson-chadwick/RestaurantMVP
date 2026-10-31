import Link from "next/link";

import { REVIEWS_PER_PAGE, type PublicRestaurantReview } from "./public-data";

function reviewPageHref(restaurantId: string, page: number) {
  return page > 1
    ? `/restaurants/${restaurantId}?reviewPage=${page}#reviews`
    : `/restaurants/${restaurantId}#reviews`;
}

export function PublicReviewList({
  reviews,
}: Readonly<{ reviews: PublicRestaurantReview[] }>) {
  if (!reviews.length) {
    return <p className="ui-status-empty">No customer reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <article
          key={`${review.submittedAt}-${index}`}
          className="rounded-2xl border border-[var(--line)] bg-white p-5"
        >
          <div
            aria-label={`${review.stars} out of 5 stars`}
            className="text-[var(--cognac-bright)]"
          >
            <span aria-hidden="true">
              {"★".repeat(review.stars)}
              {"☆".repeat(5 - review.stars)}
            </span>
          </div>
          {review.reviewText ? (
            <p className="mt-3 leading-7 whitespace-pre-wrap text-stone-700">
              {review.reviewText}
            </p>
          ) : (
            <p className="mt-3 text-sm text-stone-500">Star rating only</p>
          )}
          <p className="mt-4 text-xs text-stone-500">
            Anonymous customer ·{" "}
            {new Date(review.submittedAt).toLocaleDateString("en-US")}
            {review.updatedAt !== review.submittedAt ? " · Edited" : ""}
          </p>
        </article>
      ))}
    </div>
  );
}

export function ReviewPagination({
  restaurantId,
  page,
  totalCount,
}: Readonly<{ restaurantId: string; page: number; totalCount: number }>) {
  const hasPrevious = page > 1;
  const hasNext = page * REVIEWS_PER_PAGE < totalCount;
  if (!hasPrevious && !hasNext) return null;

  return (
    <nav aria-label="Review pages" className="mt-6 flex justify-between">
      {hasPrevious ? (
        <Link
          href={reviewPageHref(restaurantId, page - 1)}
          className="ui-button-secondary"
        >
          Previous reviews
        </Link>
      ) : (
        <span />
      )}
      {hasNext ? (
        <Link
          href={reviewPageHref(restaurantId, page + 1)}
          className="ui-button-secondary"
        >
          Next reviews
        </Link>
      ) : null}
    </nav>
  );
}
