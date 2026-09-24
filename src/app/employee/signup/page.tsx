import { AuthShell } from "@/features/auth/auth-shell";
import { redirectAuthenticatedAccount } from "@/features/auth/guards";
import { StaffSignupForm } from "@/features/auth/staff-signup-form";

export default async function EmployeeSignupPage() {
  await redirectAuthenticatedAccount();

  return (
    <AuthShell
      title="Create an employee account"
      description="Create your account, then ask your restaurant owner to add you by email."
    >
      <StaffSignupForm accountType="employee" />
    </AuthShell>
  );
}
