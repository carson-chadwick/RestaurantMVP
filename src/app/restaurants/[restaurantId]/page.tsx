import Link from "next/link";
import { notFound } from "next/navigation";

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

  let restaurant;
  try {
    restaurant = await getPublicRestaurant(restaurantId);
  } catch {
    return (
      <ProfileShell>
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
        >
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
    <ProfileShell>
      <article className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
        <p className="text-sm font-semibold text-amber-700">
          Restaurant profile
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          {restaurant.name}
        </h1>
        <div className="mt-8">
          <RestaurantDetails profile={restaurant} />
        </div>
      </article>
    </ProfileShell>
  );
}

function ProfileShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/restaurants"
          className="text-sm font-semibold text-amber-700"
        >
          ← Restaurant directory
        </Link>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
