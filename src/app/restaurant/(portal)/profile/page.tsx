import { redirect } from "next/navigation";

import { DarkHeader } from "@/components/dark-header";
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
    <main className="min-h-screen">
      <DarkHeader backHref="/restaurant" backLabel="Restaurant portal" />
      <div className="ui-container max-w-2xl py-10 sm:py-14">
        <section className="space-y-8">
          <div className="ui-card p-6 sm:p-10">
            <p className="ui-eyebrow">Account settings</p>
            <h1 className="mt-3 text-4xl text-[var(--ink)]">Staff profile</h1>
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
            <div className="ui-card p-6 sm:p-10">
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
            <div className="ui-card p-6 sm:p-8">
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
