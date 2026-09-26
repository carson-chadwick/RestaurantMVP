import { redirect } from "next/navigation";

import { DarkHeader } from "@/components/dark-header";
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
    <main className="min-h-screen">
      <DarkHeader backHref="/customer" backLabel="Customer home" />
      <div className="ui-container max-w-2xl py-10 sm:py-14">
        <section className="ui-card p-6 sm:p-10">
          <p className="ui-eyebrow">Account settings</p>
          <h1 className="mt-3 text-4xl text-[var(--ink)]">Customer profile</h1>
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
