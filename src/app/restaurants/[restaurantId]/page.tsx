import Link from "next/link";
import { notFound } from "next/navigation";

import { DarkHeader } from "@/components/dark-header";
import { PublicAccountNavigation } from "@/features/auth/public-account-navigation";
import { RestaurantDetails } from "@/features/restaurants/profile-components";
import {
  getPublicRestaurant,
  isRestaurantId,
} from "@/features/restaurants/public-data";

type PublicRestaurantPageProps = {
  params: Promise<{ restaurantId: string }>;
};

export default async function PublicRestaurantPage({
  params,
}: Readonly<PublicRestaurantPageProps>) {
  const { restaurantId } = await params;
  if (!isRestaurantId(restaurantId)) notFound();
  const accountNavigation = await PublicAccountNavigation({
    compact: true,
    inverse: true,
  });

  let restaurant;
  try {
    restaurant = await getPublicRestaurant(restaurantId);
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
