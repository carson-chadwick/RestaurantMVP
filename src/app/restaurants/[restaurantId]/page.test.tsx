import { cleanup, render, screen } from "@testing-library/react";
import Link from "next/link";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getPublicRestaurant, notFound } = vi.hoisted(() => ({
  getPublicRestaurant: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
}));

vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/features/restaurants/public-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/restaurants/public-data")>();
  return { ...original, getPublicRestaurant };
});
vi.mock("@/features/auth/public-account-navigation", () => ({
  PublicAccountNavigation: vi.fn(async () => (
    <nav aria-label="Account navigation">
      <Link href="/customer">Customer home</Link>
      <button type="button">Sign out</button>
    </nav>
  )),
}));

import { emptyRatingSummary } from "@/features/restaurants/profile";

import PublicRestaurantPage from "./page";

const id = "123e4567-e89b-42d3-a456-426614174000";
const restaurant = {
  id,
  name: "The Test Table",
  address: "123 Main St",
  phone: "801-555-0100",
  description: "A neighborhood restaurant.",
  weeklyHours: null,
  ratingSummary: emptyRatingSummary,
};

describe("public restaurant profile", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("renders safe profile details and rating state", async () => {
    getPublicRestaurant.mockResolvedValue(restaurant);
    render(
      await PublicRestaurantPage({
        params: Promise.resolve({ restaurantId: id }),
      }),
    );
    expect(
      screen.getByRole("heading", { name: restaurant.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: restaurant.phone }),
    ).toHaveAttribute("href", `tel:${restaurant.phone}`);
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /restaurant directory/i }),
    ).toHaveAttribute("href", "/restaurants");
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("returns not found for malformed or missing IDs", async () => {
    await expect(
      PublicRestaurantPage({
        params: Promise.resolve({ restaurantId: "bad" }),
      }),
    ).rejects.toThrow("not-found");
    getPublicRestaurant.mockResolvedValue(null);
    await expect(
      PublicRestaurantPage({ params: Promise.resolve({ restaurantId: id }) }),
    ).rejects.toThrow("not-found");
  });

  it("shows a safe loading error", async () => {
    getPublicRestaurant.mockRejectedValue(new Error("database detail"));
    render(
      await PublicRestaurantPage({
        params: Promise.resolve({ restaurantId: id }),
      }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't load/i);
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      `/restaurants/${id}`,
    );
    expect(screen.queryByText(/database detail/i)).not.toBeInTheDocument();
  });
});
