import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requireRestaurantStaff } = vi.hoisted(() => ({
  requireRestaurantStaff: vi.fn(),
}));

vi.mock("@/features/auth/guards", () => ({ requireRestaurantStaff }));
vi.mock("@/features/profiles/actions", () => ({
  updateCustomerProfile: vi.fn(),
  updateStaffProfile: vi.fn(),
}));
vi.mock("@/features/restaurants/profile-actions", () => ({
  updateRestaurantProfile: vi.fn(),
}));

import RestaurantProfilePage from "./page";

function queryResult(data: unknown) {
  const result = Promise.resolve({ data, error: null });
  const query = {
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(() => result),
    single: vi.fn(() => result),
  };
  return { select: vi.fn(() => query) };
}

function account(
  role: "restaurant_owner" | "restaurant_employee",
  restaurantName: string | null,
) {
  const restaurant = restaurantName
    ? {
        id: "restaurant-id",
        name: restaurantName,
        address: "123 Main St",
        phone: "801-555-0100",
        description: "A neighborhood restaurant.",
        weekly_hours: null,
      }
    : null;
  return {
    role,
    user: { id: "staff-id", email: "staff@example.com" },
    supabase: {
      auth: { signOut: vi.fn() },
      from: vi.fn((table: string) => {
        if (table === "staff_profiles") {
          return queryResult({ first_name: "Alex", last_name: "Server" });
        }
        if (table === "restaurants") return queryResult(restaurant);
        if (table === "restaurant_employees") {
          return queryResult(restaurant ? { restaurants: restaurant } : null);
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    },
  };
}

describe("restaurant profile page", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("allows an owner to edit personal and restaurant listing details", async () => {
    requireRestaurantStaff.mockResolvedValue(
      account("restaurant_owner", "The Test Table"),
    );

    render(await RestaurantProfilePage());

    expect(screen.getByLabelText("First name")).toHaveValue("Alex");
    expect(screen.getByLabelText("Restaurant name")).toHaveValue(
      "The Test Table",
    );
    expect(screen.getByLabelText("Address")).toHaveValue("123 Main St");
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
  });

  it("shows an assigned employee a read-only restaurant identity", async () => {
    requireRestaurantStaff.mockResolvedValue(
      account("restaurant_employee", "The Test Table"),
    );

    render(await RestaurantProfilePage());

    expect(screen.getByText("The Test Table")).toBeInTheDocument();
    expect(screen.queryByLabelText("Restaurant name")).not.toBeInTheDocument();
    expect(screen.getByText(/only the restaurant owner/i)).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
  });

  it("shows an unassigned employee the waiting state", async () => {
    requireRestaurantStaff.mockResolvedValue(
      account("restaurant_employee", null),
    );

    render(await RestaurantProfilePage());

    expect(
      screen.getByText("Waiting for restaurant access"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Restaurant name")).not.toBeInTheDocument();
  });
});
