import Link from "next/link";
import { redirect } from "next/navigation";

import { requireRestaurantStaff } from "@/features/auth/guards";
import { PersonalProfileForm } from "@/features/profiles/profile-forms";
import {
  RestaurantDetails,
  RestaurantProfileForm,
} from "@/features/restaurants/profile-components";
import {
  emptyRatingSummary,
  type RestaurantProfile,
  type WeeklyHours,
} from "@/features/restaurants/profile";

export default async function RestaurantProfilePage() {
  const { role, supabase, user } = await requireRestaurantStaff();
  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !user.email) {
    await supabase.auth.signOut();
    redirect("/login?error=access");
  }

  let restaurantProfile: RestaurantProfile | null = null;

  if (role === "restaurant_owner") {
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("id, name, address, phone, description, weekly_hours")
      .eq("owner_user_id", user.id)
      .single();
    if (error || !restaurant) {
      await supabase.auth.signOut();
      redirect("/login?error=access");
    }
    restaurantProfile = {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      description: restaurant.description,
      weeklyHours: restaurant.weekly_hours as WeeklyHours | null,
      ratingSummary: emptyRatingSummary,
    };
  } else {
    const { data: membership, error } = await supabase
      .from("restaurant_employees")
      .select(
        "restaurants(id, name, address, phone, description, weekly_hours)",
      )
      .eq("employee_user_id", user.id)
      .maybeSingle();
    if (error) {
      await supabase.auth.signOut();
      redirect("/login?error=access");
    }
    const restaurant = membership?.restaurants;
    restaurantProfile = restaurant
      ? {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          description: restaurant.description,
          weeklyHours: restaurant.weekly_hours as WeeklyHours | null,
          ratingSummary: emptyRatingSummary,
        }
      : null;
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/restaurant"
          className="text-sm font-semibold text-amber-700"
        >
          ← Restaurant portal
        </Link>
        <section className="mt-8 space-y-8">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Staff profile
            </h1>
            <p className="mt-2 text-stone-600">
              Manage your personal account information.
            </p>
            <div className="mt-8">
              <PersonalProfileForm
                accountType="staff"
                email={user.email}
                firstName={profile.first_name}
                lastName={profile.last_name}
              />
            </div>
          </div>

          {role === "restaurant_owner" && restaurantProfile ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
              <h2 className="text-2xl font-semibold text-stone-900">
                Restaurant profile
              </h2>
              <p className="mt-2 text-stone-600">
                Manage the details customers will see in your listing.
              </p>
              <div className="mt-8">
                <RestaurantProfileForm profile={restaurantProfile} />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-stone-900">
                {restaurantProfile?.name ?? "Waiting for restaurant access"}
              </h2>
              <p className="mt-2 text-stone-600">
                {restaurantProfile
                  ? "Only the restaurant owner can change the restaurant profile."
                  : "Ask a restaurant owner to add your employee account by email."}
              </p>
              {restaurantProfile ? (
                <div className="mt-6">
                  <RestaurantDetails profile={restaurantProfile} />
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
