import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerPage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("customer_profiles")
    .select("first_name, last_name")
    .eq("user_id", userData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect("/login?error=profile");
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-6 border-b border-stone-200 pb-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase"
          >
            Dining Plus
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/customer/profile"
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
        <section className="py-16">
          <p className="text-sm font-semibold text-amber-700">Customer home</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Welcome, {profile.first_name}.
          </h1>
          <p className="mt-5 text-lg text-stone-600">
            Signed in as {userData.user.email}
          </p>
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Your account is ready
            </h2>
            <p className="mt-2 leading-7 text-stone-600">
              Restaurant visits and rating prompts will appear here as those
              features become available.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
