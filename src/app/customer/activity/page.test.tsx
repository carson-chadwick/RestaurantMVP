import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  loadCustomerContributionCount,
  loadCustomerReputation,
  loadCustomerVisits,
} = vi.hoisted(() => ({
  loadCustomerContributionCount: vi.fn(),
  loadCustomerReputation: vi.fn(),
  loadCustomerVisits: vi.fn(),
}));

vi.mock("@/features/visits/data", () => ({
  loadCustomerContributionCount,
  loadCustomerReputation,
  loadCustomerVisits,
}));
vi.mock("@/features/visits/actions", () => ({
  deleteRestaurantReview: vi.fn(),
  recordPaidVisit: vi.fn(),
  submitCustomerRating: vi.fn(),
  submitRestaurantRating: vi.fn(),
  updateRestaurantReview: vi.fn(),
}));
vi.mock("@/features/auth/actions", () => ({ logout: vi.fn() }));

import CustomerActivityPage from "./page";

describe("customer activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadCustomerContributionCount.mockResolvedValue(5);
    loadCustomerReputation.mockResolvedValue({
      summary: { averageRating: 4.5, ratingCount: 2 },
      history: [],
    });
    loadCustomerVisits.mockResolvedValue([]);
  });
  afterEach(cleanup);

  it("shows derived points and earned milestone badges", async () => {
    render(await CustomerActivityPage());
    expect(
      screen.getByText(/50 points from 5 active reviews/i),
    ).toBeInTheDocument();
    expect(screen.getByText("First Taste")).toBeInTheDocument();
    expect(screen.getByText("Table Scout")).toBeInTheDocument();
    expect(screen.getAllByText("Earned")).toHaveLength(2);
  });

  it("shows pending reviews as activity cues", async () => {
    loadCustomerVisits.mockResolvedValue([
      {
        visitId: "123e4567-e89b-42d3-a456-426614174001",
        restaurantId: "123e4567-e89b-42d3-a456-426614174000",
        restaurantName: "The Table",
        recordedAt: "2026-10-01T12:00:00Z",
        stars: null,
        reviewText: null,
        submittedAt: null,
        updatedAt: null,
      },
    ]);
    render(await CustomerActivityPage());
    expect(screen.getByText("Pending reviews (1)")).toBeInTheDocument();
    expect(screen.getByText("The Table")).toBeInTheDocument();
  });
});
