import { AuthShell } from "@/features/auth/auth-shell";
import { redirectAuthenticatedAccount } from "@/features/auth/guards";
import { SignupForm } from "@/features/auth/signup-form";

export default async function SignupPage() {
  await redirectAuthenticatedAccount();

  return (
    <AuthShell
      title="Create your account"
      description="Join Dining Plus and help build better dining experiences."
    >
      <SignupForm />
    </AuthShell>
  );
}
