import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, rpc } = vi.hoisted(() => ({
  createClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import {
  getPublicRestaurant,
  isRestaurantId,
  listPublicRestaurants,
  listPublicRestaurantReviews,
  normalizeRestaurantPage,
  normalizeRestaurantSearch,
} from "./public-data";

const row = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  name: "The Test Table",
  address: "123 Main St",
  phone: null,
  description: null,
  weekly_hours: null,
  average_rating: null,
  rating_count: 0,
};

describe("public restaurant data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({ rpc });
  });

  it("normalizes search and page query values", () => {
    expect(normalizeRestaurantSearch("  Table  ")).toBe("Table");
    expect(normalizeRestaurantSearch("x".repeat(120))).toHaveLength(100);
    expect(normalizeRestaurantPage("3")).toBe(3);
    expect(normalizeRestaurantPage("-1")).toBe(1);
    expect(normalizeRestaurantPage("not-a-page")).toBe(1);
  });

  it("lists a page and maps its safe public fields", async () => {
    rpc.mockResolvedValue({
      data: [{ ...row, total_count: 13 }],
      error: null,
    });

    const result = await listPublicRestaurants("Table", 2);

    expect(rpc).toHaveBeenCalledWith("list_public_restaurants", {
      search_text: "Table",
      result_limit: 12,
      result_offset: 12,
    });
    expect(result).toEqual({
      restaurants: [
        {
          id: row.id,
          name: row.name,
          address: row.address,
          phone: null,
          description: null,
          weeklyHours: null,
          ratingSummary: { averageRating: null, ratingCount: 0 },
        },
      ],
      totalCount: 13,
    });
  });

  it("loads one restaurant and returns null when it is missing", async () => {
    rpc.mockResolvedValueOnce({ data: [row], error: null });
    await expect(getPublicRestaurant(row.id)).resolves.toMatchObject({
      id: row.id,
      name: row.name,
    });

    rpc.mockResolvedValueOnce({ data: [], error: null });
    await expect(getPublicRestaurant(row.id)).resolves.toBeNull();
  });

  it("loads only anonymous public review fields", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          stars: 5,
          review_text: "Excellent service.",
          submitted_at: "2026-10-01T12:00:00Z",
          updated_at: "2026-10-01T12:00:00Z",
          total_count: 1,
        },
      ],
      error: null,
    });
    await expect(listPublicRestaurantReviews(row.id, 1)).resolves.toEqual({
      reviews: [
        {
          stars: 5,
          reviewText: "Excellent service.",
          submittedAt: "2026-10-01T12:00:00Z",
          updatedAt: "2026-10-01T12:00:00Z",
        },
      ],
      totalCount: 1,
    });
    expect(rpc).toHaveBeenCalledWith("list_public_restaurant_reviews", {
      target_restaurant_id: row.id,
      result_limit: 10,
      result_offset: 0,
    });
  });

  it("rejects malformed restaurant IDs", () => {
    expect(isRestaurantId(row.id)).toBe(true);
    expect(isRestaurantId("not-a-uuid")).toBe(false);
  });

  it("returns safe errors when the database is unavailable", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: new Error("connection secret"),
    });
    await expect(listPublicRestaurants("", 1)).rejects.toThrow(
      "restaurant_directory_unavailable",
    );
    await expect(getPublicRestaurant(row.id)).rejects.toThrow(
      "restaurant_profile_unavailable",
    );
  });
});
