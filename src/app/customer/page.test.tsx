import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, listPublicRestaurants, redirect, signOut } = vi.hoisted(
  () => ({
    createClient: vi.fn(),
    listPublicRestaurants: vi.fn(),
    redirect: vi.fn((path: string) => {
      throw new Error(`redirect:${path}`);
    }),
    signOut: vi.fn(),
  }),
);

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/features/restaurants/public-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/restaurants/public-data")>();
  return { ...original, listPublicRestaurants };
});
vi.mock("@/features/visits/actions", () => ({
  recordPaidVisit: vi.fn(),
  submitCustomerRating: vi.fn(),
  submitRestaurantRating: vi.fn(),
}));

import CustomerPage from "./page";

function customerClient({
  profile = { first_name: "Ada", last_name: "Lovelace" },
  user = { id: "customer-id", email: "ada@example.com" },
}: {
  profile?: { first_name: string; last_name: string } | null;
  user?: { id: string; email: string } | null;
} = {}) {
  const single = vi.fn().mockResolvedValue({
    data: profile,
    error: profile ? null : new Error("Profile not found"),
  });
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error("Not authenticated"),
      }),
      signOut,
    },
    from: vi.fn(() => ({ select })),
  };
}

describe("customer home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPublicRestaurants.mockResolvedValue({
      restaurants: [
        {
          id: "123e4567-e89b-42d3-a456-426614174000",
          name: "The Table",
          address: null,
          phone: null,
          description: null,
          weeklyHours: null,
          ratingSummary: { averageRating: 4.5, ratingCount: 2 },
        },
      ],
      totalCount: 1,
    });
  });

  it("shows restaurant discovery instead of private reputation details", async () => {
    createClient.mockResolvedValue(customerClient());

    render(await CustomerPage());
    expect(
      screen.getByRole("heading", { name: "Find your next table." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "The Table" })).toHaveAttribute(
      "href",
      "/restaurants/123e4567-e89b-42d3-a456-426614174000",
    );
  });
  afterEach(cleanup);

  it("shows a safe directory error", async () => {
    listPublicRestaurants.mockRejectedValue(new Error("private detail"));
    render(await CustomerPage());
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't load/i);
  });

  it("passes normalized customer search parameters to discovery", async () => {
    render(
      await CustomerPage({
        searchParams: Promise.resolve({ q: " Table ", page: "2" }),
      }),
    );
    expect(listPublicRestaurants).toHaveBeenCalledWith("Table", 2);
  });
});
