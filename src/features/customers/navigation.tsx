import Link from "next/link";

import { logout } from "@/features/auth/actions";

export function CustomerNavigation({
  pendingCount,
  points,
}: Readonly<{ pendingCount: number; points: number | null }>) {
  return (
    <nav
      aria-label="Customer navigation"
      className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end"
    >
      <Link href="/customer" className="ui-button-inverse">
        Restaurants
      </Link>
      <Link href="/customer/activity" className="ui-button-inverse">
        Activity{pendingCount > 0 ? ` (${pendingCount})` : ""}
      </Link>
      <span
        className="inline-flex min-h-11 items-center rounded-full border border-[#d17842]/60 bg-[#d17842]/15 px-4 text-sm font-bold text-[#f3bd91]"
        aria-label={points === null ? "Points unavailable" : `${points} points`}
      >
        <span aria-hidden="true">★&nbsp;</span>
        {points === null ? "Points unavailable" : `${points} points`}
      </span>
      <Link href="/customer/profile" className="ui-button-inverse">
        Profile
      </Link>
      <form action={logout}>
        <button type="submit" className="ui-button-inverse">
          Sign out
        </button>
      </form>
    </nav>
  );
}
