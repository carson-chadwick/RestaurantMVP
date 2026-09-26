import Link from "next/link";
import { redirect } from "next/navigation";

import { DarkHeader } from "@/components/dark-header";
import { logout } from "@/features/auth/actions";
import { EmployeeManagement } from "@/features/restaurants/employee-management";
import { createClient } from "@/lib/supabase/server";

function PortalHeader() {
  return (
    <DarkHeader>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
        <Link href="/restaurant/visits" className="ui-button-inverse">
          Visits
        </Link>
        <Link href="/restaurant/profile" className="ui-button-inverse">
          Profile
        </Link>
        <form action={logout}>
          <button type="submit" className="ui-button-inverse">
            Sign out
          </button>
        </form>
      </div>
    </DarkHeader>
  );
}

export default async function RestaurantPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) redirect("/login");

  const [{ data: roleData }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase
        .from("account_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .single(),
      supabase
        .from("staff_profiles")
        .select("first_name, last_name")
        .eq("user_id", userData.user.id)
        .single(),
    ]);

  if (roleData?.role === "customer") redirect("/customer");

  if (
    profileError ||
    !profile ||
    (roleData?.role !== "restaurant_owner" &&
      roleData?.role !== "restaurant_employee")
  ) {
    await supabase.auth.signOut();
    redirect("/login?error=access");
  }

  if (roleData.role === "restaurant_owner") {
    const [{ data: restaurant, error: restaurantError }, employeeResult] =
      await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name")
          .eq("owner_user_id", userData.user.id)
          .single(),
        supabase.rpc("list_restaurant_employees"),
      ]);

    if (restaurantError || !restaurant || employeeResult.error) {
      await supabase.auth.signOut();
      redirect("/login?error=access");
    }

    return (
      <main className="min-h-screen">
        <PortalHeader />
        <div className="ui-container max-w-5xl">
          <section className="py-14">
            <p className="ui-eyebrow">Restaurant owner</p>
            <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
              {restaurant.name}
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              Managed by {profile.first_name} {profile.last_name}
            </p>
            <EmployeeManagement employees={employeeResult.data ?? []} />
          </section>
        </div>
      </main>
    );
  }

  const { data: membership, error: membershipError } = await supabase
    .from("restaurant_employees")
    .select("restaurant_id")
    .eq("employee_user_id", userData.user.id)
    .maybeSingle();

  if (membershipError) {
    await supabase.auth.signOut();
    redirect("/login?error=access");
  }

  if (!membership) {
    return (
      <main className="min-h-screen">
        <PortalHeader />
        <div className="ui-container max-w-5xl">
          <section className="py-16">
            <p className="ui-eyebrow">Restaurant employee</p>
            <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
              Your account is ready, {profile.first_name}.
            </h1>
            <div className="ui-card mt-10 p-6">
              <h2 className="text-lg font-semibold text-stone-900">
                Waiting for restaurant access
              </h2>
              <p className="mt-2 leading-7 text-stone-600">
                Ask your restaurant owner to add {userData.user.email} from
                their portal.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", membership.restaurant_id)
    .single();

  if (restaurantError || !restaurant) {
    await supabase.auth.signOut();
    redirect("/login?error=access");
  }

  return (
    <main className="min-h-screen">
      <PortalHeader />
      <div className="ui-container max-w-5xl">
        <section className="py-16">
          <p className="ui-eyebrow">Restaurant employee</p>
          <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
            {restaurant.name}
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Signed in as {profile.first_name} {profile.last_name}
          </p>
          <div className="ui-card mt-10 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Employee access active
            </h2>
            <p className="mt-2 leading-7 text-stone-600">
              Use Visits to record paid visits and rate eligible customers.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
