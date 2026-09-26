import { AuthShell } from "@/features/auth/auth-shell";
import { redirectAuthenticatedAccount } from "@/features/auth/guards";
import { SignupForm } from "@/features/auth/signup-form";

export default async function CustomerSignupPage() {
  await redirectAuthenticatedAccount();

  return (
    <AuthShell
      title="Create a customer account"
      description="Join Dining+ and help build better dining experiences."
    >
      <SignupForm />
    </AuthShell>
  );
}
