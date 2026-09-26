import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createClient,
  loadCustomerReputation,
  loadCustomerVisits,
  redirect,
  signOut,
} = vi.hoisted(() => ({
  createClient: vi.fn(),
  loadCustomerReputation: vi.fn(),
  loadCustomerVisits: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/features/visits/data", () => ({
  loadCustomerReputation,
  loadCustomerVisits,
}));
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
    loadCustomerVisits.mockResolvedValue([]);
    loadCustomerReputation.mockResolvedValue({
      summary: { averageRating: null, ratingCount: 0 },
      history: [],
    });
  });

  it("shows the customer's private aggregate and individual history", async () => {
    createClient.mockResolvedValue(customerClient());
    loadCustomerReputation.mockResolvedValue({
      summary: { averageRating: 4.3, ratingCount: 7 },
      history: [
        {
          visitId: "visit-id",
          restaurantId: "restaurant-id",
          restaurantName: "The Table",
          recordedAt: "2026-09-29T12:00:00Z",
          stars: 5,
          submittedAt: "2026-09-30T12:00:00Z",
        },
      ],
    });

    render(await CustomerPage());
    expect(screen.getByText("Your customer rating")).toBeInTheDocument();
    expect(screen.getByText("4.3 average")).toBeInTheDocument();
    expect(screen.getByText("7 ratings")).toBeInTheDocument();
    expect(screen.getByText("The Table")).toBeInTheDocument();
    expect(screen.getByText("5 stars")).toBeInTheDocument();
    expect(screen.queryByText(/staff member/i)).not.toBeInTheDocument();
  });
  afterEach(cleanup);

  it("shows pending rating prompts and recent rated visits", async () => {
    createClient.mockResolvedValue(customerClient());
    loadCustomerVisits.mockResolvedValue([
      {
        visitId: "pending-id",
        restaurantId: "restaurant-id",
        restaurantName: "Pending Table",
        recordedAt: "2026-09-29T12:00:00Z",
        stars: null,
        submittedAt: null,
      },
      {
        visitId: "rated-id",
        restaurantId: "restaurant-id",
        restaurantName: "Rated Table",
        recordedAt: "2026-09-28T12:00:00Z",
        stars: 4,
        submittedAt: "2026-09-28T13:00:00Z",
      },
    ]);

    render(await CustomerPage());

    expect(screen.getByText("Pending Table")).toBeInTheDocument();
    expect(screen.getByText("Rated Table")).toBeInTheDocument();
    expect(screen.getAllByText("4 stars")).not.toHaveLength(0);
  });

  it("shows the authenticated customer's identity and sign-out control", async () => {
    createClient.mockResolvedValue(customerClient());

    render(await CustomerPage());

    expect(
      screen.getByRole("heading", { name: "Welcome, Ada." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Signed in as ada@example.com"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse restaurants" }),
    ).toHaveAttribute("href", "/restaurants");
  });

  it("redirects an unauthenticated visitor to login", async () => {
    createClient.mockResolvedValue(customerClient({ user: null }));

    await expect(CustomerPage()).rejects.toThrow("redirect:/login");
  });

  it("clears the session when the linked profile is missing", async () => {
    createClient.mockResolvedValue(customerClient({ profile: null }));

    await expect(CustomerPage()).rejects.toThrow(
      "redirect:/login?error=profile",
    );
    expect(signOut).toHaveBeenCalledOnce();
  });
});
