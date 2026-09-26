import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { logout } from "./actions";
import { getAccountDestination } from "./role";

type PublicAccountNavigationProps = {
  includeBrowse?: boolean;
  includeSignupActions?: boolean;
  compact?: boolean;
};

export async function PublicAccountNavigation({
  includeBrowse = false,
  includeSignupActions = false,
  compact = false,
}: Readonly<PublicAccountNavigationProps>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const destination = data.user
    ? await getAccountDestination(supabase, data.user.id)
    : null;
  const linkClass = compact
    ? "rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900"
    : "rounded-xl border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-800 hover:bg-stone-50";

  return (
    <nav
      aria-label="Account navigation"
      className={`flex flex-wrap items-center gap-2 ${compact ? "justify-end" : "justify-center sm:gap-3"}`}
    >
      {includeBrowse ? (
        <Link
          href="/restaurants"
          className={
            compact
              ? linkClass
              : "rounded-xl bg-amber-700 px-6 py-3 font-semibold text-white hover:bg-amber-800"
          }
        >
          Browse restaurants
        </Link>
      ) : null}

      {!data.user && includeSignupActions ? (
        <>
          <Link
            href="/signup"
            className="rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-stone-700"
          >
            Create customer account
          </Link>
          <Link href="/restaurant/signup" className={linkClass}>
            Create restaurant account
          </Link>
        </>
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
