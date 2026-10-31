import Link from "next/link";
import { notFound } from "next/navigation";

import { DarkHeader } from "@/components/dark-header";
import { PublicAccountNavigation } from "@/features/auth/public-account-navigation";
import { RestaurantDetails } from "@/features/restaurants/profile-components";
import {
  getPublicRestaurant,
  isRestaurantId,
  listPublicRestaurantReviews,
  normalizeReviewPage,
} from "@/features/restaurants/public-data";
import {
  PublicReviewList,
  ReviewPagination,
} from "@/features/restaurants/review-components";

type PublicRestaurantPageProps = {
  params: Promise<{ restaurantId: string }>;
  searchParams?: Promise<{ reviewPage?: string | string[] }>;
};

export default async function PublicRestaurantPage({
  params,
  searchParams = Promise.resolve({}),
}: Readonly<PublicRestaurantPageProps>) {
  const { restaurantId } = await params;
  if (!isRestaurantId(restaurantId)) notFound();
  const reviewPage = normalizeReviewPage((await searchParams).reviewPage);
  const accountNavigation = await PublicAccountNavigation({
    compact: true,
    inverse: true,
  });

  let restaurant;
  let reviewResult;
  try {
    [restaurant, reviewResult] = await Promise.all([
      getPublicRestaurant(restaurantId),
      listPublicRestaurantReviews(restaurantId, reviewPage),
    ]);
  } catch {
    return (
      <ProfileShell accountNavigation={accountNavigation}>
        <div role="alert" className="ui-status-error">
          <p>We couldn&apos;t load this restaurant.</p>
          <Link
            href={`/restaurants/${restaurantId}`}
            className="mt-3 inline-block font-semibold underline"
          >
            Try again
          </Link>
        </div>
      </ProfileShell>
    );
  }

  if (!restaurant) notFound();

  return (
    <ProfileShell accountNavigation={accountNavigation}>
      <article className="ui-card overflow-hidden p-6 sm:p-12">
        <p className="ui-eyebrow">Restaurant profile</p>
        <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
          {restaurant.name}
        </h1>
        <div className="mt-8">
          <RestaurantDetails profile={restaurant} />
        </div>
        <section
          id="reviews"
          className="mt-12 border-t border-[var(--line)] pt-10"
        >
          <p className="ui-eyebrow">Customer experiences</p>
          <h2 className="mt-3 text-3xl text-[var(--ink)]">Reviews</h2>
          <p className="mt-3 text-sm text-stone-500">
            Reviews are tied to restaurant-added visits. Customer identities are
            not shown publicly.
          </p>
          <div className="mt-6">
            <PublicReviewList reviews={reviewResult.reviews} />
            <ReviewPagination
              restaurantId={restaurantId}
              page={reviewPage}
              totalCount={reviewResult.totalCount}
            />
          </div>
        </section>
      </article>
    </ProfileShell>
  );
}

function ProfileShell({
  accountNavigation,
  children,
}: Readonly<{
  accountNavigation: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <DarkHeader>{accountNavigation}</DarkHeader>
      <div className="ui-container max-w-4xl py-8 sm:py-12">
        <Link href="/restaurants" className="ui-button-quiet">
          ← Restaurant directory
        </Link>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
