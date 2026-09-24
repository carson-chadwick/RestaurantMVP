import { redirect } from "next/navigation";

import { AuthShell } from "@/features/auth/auth-shell";
import { SignupForm } from "@/features/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/customer");
  }

  return (
    <AuthShell
      title="Create your account"
      description="Join Dining Plus and help build better dining experiences."
    >
      <SignupForm />
    </AuthShell>
  );
}
