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

import { emptyRatingSummary } from "@/features/restaurants/profile";

import RestaurantDirectoryPage from "./page";

const restaurant = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  name: "The Test Table",
  address: null,
  phone: null,
  description: null,
  weeklyHours: null,
  ratingSummary: emptyRatingSummary,
};

describe("public restaurant directory", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("renders searchable restaurant results", async () => {
    listPublicRestaurants.mockResolvedValue({
      restaurants: [restaurant],
      totalCount: 1,
    });
    render(
      await RestaurantDirectoryPage({
        searchParams: Promise.resolve({ q: "  Test  ", page: "bad" }),
      }),
    );
    expect(listPublicRestaurants).toHaveBeenCalledWith("Test", 1);
    expect(screen.getByLabelText("Search restaurants by name")).toHaveValue(
      "Test",
    );
    expect(
      screen.getByRole("link", { name: restaurant.name }),
    ).toBeInTheDocument();
  });

  it("distinguishes empty search results from an empty directory", async () => {
    listPublicRestaurants.mockResolvedValue({ restaurants: [], totalCount: 0 });
    render(
      await RestaurantDirectoryPage({
        searchParams: Promise.resolve({ q: "Missing" }),
      }),
    );
    expect(screen.getByText("No matching restaurants")).toBeInTheDocument();
    cleanup();
    render(
      await RestaurantDirectoryPage({ searchParams: Promise.resolve({}) }),
    );
    expect(screen.getByText("No restaurants yet")).toBeInTheDocument();
  });

  it("handles out-of-range pages and data errors", async () => {
    listPublicRestaurants.mockResolvedValueOnce({
      restaurants: [],
      totalCount: 0,
    });
    render(
      await RestaurantDirectoryPage({
        searchParams: Promise.resolve({ page: "9" }),
      }),
    );
    expect(screen.getByText("No restaurants on this page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toBeInTheDocument();
    cleanup();
    listPublicRestaurants.mockRejectedValueOnce(new Error("offline"));
    render(
      await RestaurantDirectoryPage({ searchParams: Promise.resolve({}) }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't load/i);
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/restaurants",
    );
  });
});
