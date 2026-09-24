import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, redirect, signOut } = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/features/auth/actions", () => ({ logout: vi.fn() }));
vi.mock("@/features/restaurants/actions", () => ({
  grantEmployeeAccess: vi.fn(),
  revokeEmployeeAccess: vi.fn(),
}));

import RestaurantPage from "./page";

type Role = "customer" | "restaurant_owner" | "restaurant_employee";

function queryResult(data: unknown, error: Error | null = null) {
  const result = Promise.resolve({ data, error });
  const query = {
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(() => result),
    single: vi.fn(() => result),
  };
  return { select: vi.fn(() => query) };
}

function portalClient({
  role,
  membershipRestaurantId,
}: {
  role: Role;
  membershipRestaurantId?: string | null;
}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-id", email: "staff@example.com" } },
        error: null,
      }),
      signOut,
    },
    from: vi.fn((table: string) => {
      if (table === "account_roles") return queryResult({ role });
      if (table === "staff_profiles") {
        return queryResult({ first_name: "Alex", last_name: "Server" });
      }
      if (table === "restaurant_employees") {
        return queryResult(
          membershipRestaurantId
            ? { restaurant_id: membershipRestaurantId }
            : null,
        );
      }
      if (table === "restaurants") {
        return queryResult({ id: "restaurant-id", name: "The Test Table" });
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    rpc: vi.fn().mockResolvedValue({
      data: [
        {
          user_id: "employee-id",
          first_name: "Pat",
          last_name: "Cook",
          email: "pat@example.com",
        },
      ],
      error: null,
    }),
  };
}

describe("restaurant portal", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("shows restaurant and employee management to the owner", async () => {
    createClient.mockResolvedValue(portalClient({ role: "restaurant_owner" }));

    render(await RestaurantPage());

    expect(
      screen.getByRole("heading", { name: "The Test Table" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Managed by Alex Server")).toBeInTheDocument();
    expect(screen.getByText("Pat Cook")).toBeInTheDocument();
    expect(screen.getByText("pat@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Grant access" }),
    ).toBeInTheDocument();
  });

  it("shows an assigned employee their restaurant", async () => {
    createClient.mockResolvedValue(
      portalClient({
        role: "restaurant_employee",
        membershipRestaurantId: "restaurant-id",
      }),
    );

    render(await RestaurantPage());

    expect(
      screen.getByRole("heading", { name: "The Test Table" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Employee access active")).toBeInTheDocument();
    expect(screen.queryByText("Employees")).not.toBeInTheDocument();
  });

  it("shows an unassigned employee the waiting state", async () => {
    createClient.mockResolvedValue(
      portalClient({
        role: "restaurant_employee",
        membershipRestaurantId: null,
      }),
    );

    render(await RestaurantPage());

    expect(
      screen.getByText("Waiting for restaurant access"),
    ).toBeInTheDocument();
    expect(screen.getByText(/staff@example.com/)).toBeInTheDocument();
  });

  it("redirects customer accounts away from the staff portal", async () => {
    createClient.mockResolvedValue(portalClient({ role: "customer" }));

    await expect(RestaurantPage()).rejects.toThrow("redirect:/customer");
  });

  it("redirects unauthenticated visitors to login", async () => {
    const client = portalClient({ role: "restaurant_employee" });
    client.auth.getUser.mockResolvedValue({
      data: { user: null as never },
      error: new Error("Not authenticated"),
    });
    createClient.mockResolvedValue(client);

    await expect(RestaurantPage()).rejects.toThrow("redirect:/login");
  });
});
