import Link from "next/link";

import { DarkHeader } from "@/components/dark-header";
import { AccountTypeChooser } from "@/features/auth/account-type-chooser";
import { redirectAuthenticatedAccount } from "@/features/auth/guards";

export default async function SignupPage() {
  await redirectAuthenticatedAccount();

  return (
    <main className="min-h-screen">
      <DarkHeader>
        <Link href="/login" className="ui-button-inverse">
          Sign in
        </Link>
      </DarkHeader>
      <section className="ui-container py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="ui-eyebrow">Join Dining+</p>
          <h1 className="mt-4 text-5xl text-[var(--ink)] sm:text-6xl">
            Choose your account type.
          </h1>
          <p className="mt-5 text-lg text-[var(--ink-soft)]">
            Select the role that best describes how you will use Dining+.
          </p>
        </div>
        <div className="mt-12">
          <AccountTypeChooser />
        </div>
      </section>
    </main>
  );
}
