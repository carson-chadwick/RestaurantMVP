import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { logout } from "./actions";
import { getAccountDestination } from "./role";

type PublicAccountNavigationProps = {
  includeBrowse?: boolean;
  includeSignupAction?: boolean;
  compact?: boolean;
  inverse?: boolean;
};

export async function PublicAccountNavigation({
  includeBrowse = false,
  includeSignupAction = false,
  compact = false,
  inverse = false,
}: Readonly<PublicAccountNavigationProps>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const destination = data.user
    ? await getAccountDestination(supabase, data.user.id)
    : null;
  const linkClass = inverse
    ? "ui-button-inverse backdrop-blur-sm"
    : compact
      ? "ui-button-quiet"
      : "ui-button-secondary";

  return (
    <nav
      aria-label="Account navigation"
      className={`flex flex-wrap items-center gap-2 ${compact ? "justify-end" : "justify-center sm:gap-3"}`}
    >
      {includeBrowse ? (
        <Link
          href="/restaurants"
          className={compact || inverse ? linkClass : "ui-button-primary"}
        >
          Browse restaurants
        </Link>
      ) : null}

      {!data.user && includeSignupAction ? (
        <Link href="/signup" className="ui-button-primary">
          Create account
        </Link>
      ) : null}

      {!data.user ? (
        <Link href="/login" className={linkClass}>
          Sign in
        </Link>
      ) : (
        <>
          {destination ? (
            <Link href={destination} className={linkClass}>
              {destination === "/customer"
                ? "Customer home"
                : "Restaurant portal"}
            </Link>
          ) : null}
          <form action={logout}>
            <button type="submit" className={linkClass}>
              Sign out
            </button>
          </form>
        </>
      )}
    </nav>
  );
}
