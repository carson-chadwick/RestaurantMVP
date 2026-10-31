import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { listPublicRestaurants } = vi.hoisted(() => ({
  listPublicRestaurants: vi.fn(),
}));

vi.mock("@/features/restaurants/public-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/restaurants/public-data")>();
  return { ...original, listPublicRestaurants };
});
vi.mock("@/features/auth/actions", () => ({ logout: vi.fn() }));

import CustomerPage from "./page";

const restaurant = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  name: "The Table",
  address: "123 Main St",
  phone: null,
  description: "A neighborhood restaurant.",
  weeklyHours: null,
  ratingSummary: { averageRating: 4.5, ratingCount: 8 },
};

describe("customer home restaurant discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPublicRestaurants.mockResolvedValue({
      restaurants: [restaurant],
      totalCount: 1,
    });
  });
  afterEach(cleanup);

  it("makes restaurant discovery the signed-in home", async () => {
    render(await CustomerPage());
    expect(
      screen.getByRole("heading", { name: "Find your next table." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: restaurant.name })).toHaveAttribute(
      "href",
      `/restaurants/${restaurant.id}`,
    );
  });

  it("preserves search and pagination on the customer route", async () => {
    listPublicRestaurants.mockResolvedValue({
      restaurants: [restaurant],
      totalCount: 30,
    });
    render(
      await CustomerPage({
        searchParams: Promise.resolve({ q: "Table", page: "2" }),
      }),
    );
    expect(listPublicRestaurants).toHaveBeenCalledWith("Table", 2);
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/customer?q=Table",
    );
  });
});
