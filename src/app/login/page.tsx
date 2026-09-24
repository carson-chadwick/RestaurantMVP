import { AuthShell } from "@/features/auth/auth-shell";
import { redirectAuthenticatedAccount } from "@/features/auth/guards";
import { LoginForm } from "@/features/auth/login-form";

export default async function LoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ error?: string }> }>) {
  await redirectAuthenticatedAccount();

  const params = await searchParams;
  const initialError = params.error
    ? "We couldn't load access for your account. Please try signing in again."
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
