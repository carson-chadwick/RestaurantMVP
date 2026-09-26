import Link from "next/link";
import { redirect } from "next/navigation";

import { requireCustomer } from "@/features/auth/guards";
import { PersonalProfileForm } from "@/features/profiles/profile-forms";

export default async function CustomerProfilePage() {
  const { supabase, user } = await requireCustomer();
  const { data: profile, error } = await supabase
    .from("customer_profiles")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .single();

  if (error || !profile || !user.email) {
    await supabase.auth.signOut();
    redirect("/login?error=access");
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/customer" className="text-sm font-semibold text-amber-700">
          ← Customer home
        </Link>
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Customer profile
          </h1>
          <p className="mt-2 text-stone-600">
            Manage your basic account information.
          </p>
          <div className="mt-8">
            <PersonalProfileForm
              accountType="customer"
              email={user.email}
              firstName={profile.first_name}
              lastName={profile.last_name}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
