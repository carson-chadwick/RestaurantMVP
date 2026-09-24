import { redirect } from "next/navigation";

import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/customer");
  }

  const params = await searchParams;
  const initialError =
    params.error === "profile"
      ? "We couldn't load your customer profile. Please try signing in again."
      : undefined;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your Dining Plus account."
    >
      <LoginForm initialError={initialError} />
    </AuthShell>
  );
}
