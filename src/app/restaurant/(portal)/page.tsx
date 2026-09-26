import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/features/auth/actions";
import { EmployeeManagement } from "@/features/restaurants/employee-management";
import { createClient } from "@/lib/supabase/server";

function PortalHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/"
        className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase"
      >
        Dining Plus
      </Link>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
        <Link
          href="/restaurant/visits"
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
        >
          Visits
        </Link>
        <Link
          href="/restaurant/profile"
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
        >
          Profile
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
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
      <main className="min-h-screen px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <PortalHeader />
          <section className="py-14">
            <p className="text-sm font-semibold text-amber-700">
              Restaurant owner
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
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
      <main className="min-h-screen px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <PortalHeader />
          <section className="py-16">
            <p className="text-sm font-semibold text-amber-700">
              Restaurant employee
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">
              Your account is ready, {profile.first_name}.
            </h1>
            <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
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
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <PortalHeader />
        <section className="py-16">
          <p className="text-sm font-semibold text-amber-700">
            Restaurant employee
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            {restaurant.name}
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Signed in as {profile.first_name} {profile.last_name}
          </p>
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
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
