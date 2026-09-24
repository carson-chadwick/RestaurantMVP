import { AuthShell } from "@/features/auth/auth-shell";
import { redirectAuthenticatedAccount } from "@/features/auth/guards";
import { StaffSignupForm } from "@/features/auth/staff-signup-form";

export default async function RestaurantSignupPage() {
  await redirectAuthenticatedAccount();

  return (
    <AuthShell
      title="Create a restaurant account"
      description="Create your owner account and begin setting up your restaurant."
    >
      <StaffSignupForm accountType="owner" />
    </AuthShell>
  );
}
