import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireCustomer, requireRestaurantStaff, rpc } = vi.hoisted(() => ({
  requireCustomer: vi.fn(),
  requireRestaurantStaff: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/features/auth/guards", () => ({
  requireCustomer,
  requireRestaurantStaff,
}));

import {
  loadCustomerReputation,
  loadCustomerVisits,
  loadStaffVisitWorkspace,
} from "./data";

describe("visit data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCustomer.mockResolvedValue({ supabase: { rpc } });
    requireRestaurantStaff.mockResolvedValue({ supabase: { rpc } });
  });

  it("loads exact-name customer results and recent staff visits", async () => {
    rpc.mockImplementation((name: string) => {
      if (name === "list_customers_for_visit") {
        return Promise.resolve({
          data: [
            {
              user_id: "customer-id",
              first_name: "Ada",
              last_name: "Lovelace",
              email: "ada@example.com",
              average_rating: "4.5",
              rating_count: 2,
              total_count: 1,
            },
          ],
          error: null,
        });
      }
      if (name === "list_staff_recent_visits") {
        return Promise.resolve({
          data: [
            {
              visit_id: "visit-id",
              customer_user_id: "customer-id",
              customer_first_name: "Ada",
              customer_last_name: "Lovelace",
              customer_email: "ada@example.com",
              recorded_at: "2026-09-29T12:00:00Z",
              rating_status: "ready_to_rate_customer",
            },
          ],
          error: null,
        });
      }
      return Promise.resolve({
        data: [
          {
            visit_id: "visit-id",
            customer_user_id: "customer-id",
            customer_first_name: "Ada",
            customer_last_name: "Lovelace",
            customer_email: "ada@example.com",
            recorded_at: "2026-09-29T12:00:00Z",
            average_rating: "4.5",
            rating_count: 2,
            total_count: 1,
          },
        ],
        error: null,
      });
    });

    const result = await loadStaffVisitWorkspace("Ada", "Lovelace", 2, 3);
    expect(rpc).toHaveBeenCalledWith(
      "list_customers_for_visit",
      expect.objectContaining({
        search_first_name: "Ada",
        search_last_name: "Lovelace",
        result_offset: 20,
      }),
    );
    expect(result.totalCount).toBe(1);
    expect(result.customers[0]).toMatchObject({
      averageRating: 4.5,
      ratingCount: 2,
    });
    expect(result.recentVisits[0]).toMatchObject({
      visitId: "visit-id",
      ratingStatus: "ready_to_rate_customer",
    });
    expect(rpc).toHaveBeenCalledWith("list_staff_customer_rating_queue", {
      result_limit: 20,
      result_offset: 40,
    });
    expect(result.ratingQueueTotalCount).toBe(1);
  });

  it("loads only the authenticated customer's private reputation", async () => {
    rpc.mockImplementation((name: string) =>
      Promise.resolve(
        name === "get_customer_rating_summary"
          ? {
              data: [{ average_rating: "4.3", rating_count: 7 }],
              error: null,
            }
          : {
              data: [
                {
                  visit_id: "visit-id",
                  restaurant_id: "restaurant-id",
                  restaurant_name: "The Table",
                  recorded_at: "2026-09-29T12:00:00Z",
                  stars: 4,
                  submitted_at: "2026-09-30T12:00:00Z",
                },
              ],
              error: null,
            },
      ),
    );

    await expect(loadCustomerReputation()).resolves.toEqual({
      summary: { averageRating: 4.3, ratingCount: 7 },
      history: [
        {
          visitId: "visit-id",
          restaurantId: "restaurant-id",
          restaurantName: "The Table",
          recordedAt: "2026-09-29T12:00:00Z",
          stars: 4,
          submittedAt: "2026-09-30T12:00:00Z",
        },
      ],
    });
    expect(requireCustomer).toHaveBeenCalledOnce();
  });

  it("loads only the authenticated customer's visits", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          visit_id: "visit-id",
          restaurant_id: "restaurant-id",
          restaurant_name: "The Table",
          recorded_at: "2026-09-29T12:00:00Z",
          stars: null,
          submitted_at: null,
        },
      ],
      error: null,
    });
    await expect(loadCustomerVisits()).resolves.toEqual([
      {
        visitId: "visit-id",
        restaurantId: "restaurant-id",
        restaurantName: "The Table",
        recordedAt: "2026-09-29T12:00:00Z",
        stars: null,
        submittedAt: null,
      },
    ]);
    expect(requireCustomer).toHaveBeenCalledOnce();
  });

  it("uses safe errors", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("secret") });
    await expect(loadStaffVisitWorkspace("", "", 1)).rejects.toThrow(
      "staff_visits_unavailable",
    );
    await expect(loadCustomerVisits()).rejects.toThrow(
      "customer_visits_unavailable",
    );
    await expect(loadCustomerReputation()).rejects.toThrow(
      "customer_reputation_unavailable",
    );
  });
});
