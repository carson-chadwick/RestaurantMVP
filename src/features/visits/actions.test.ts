import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, requireCustomer, requireRestaurantStaff, rpc } =
  vi.hoisted(() => ({
    revalidatePath: vi.fn(),
    requireCustomer: vi.fn(),
    requireRestaurantStaff: vi.fn(),
    rpc: vi.fn(),
  }));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/features/auth/guards", () => ({
  requireCustomer,
  requireRestaurantStaff,
}));

import {
  recordPaidVisit,
  submitCustomerRating,
  submitRestaurantRating,
} from "./actions";

function formData(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

const customerId = "123e4567-e89b-42d3-a456-426614174000";
const visitId = "123e4567-e89b-42d3-a456-426614174001";

describe("visit actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireRestaurantStaff.mockResolvedValue({ supabase: { rpc } });
    requireCustomer.mockResolvedValue({ supabase: { rpc } });
  });

  it("requires restaurant staff and records the selected customer", async () => {
    rpc.mockResolvedValue({ data: visitId, error: null });
    const state = await recordPaidVisit({}, formData({ customerId }));
    expect(requireRestaurantStaff).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith("record_paid_visit", {
      target_customer_user_id: customerId,
    });
    expect(state).toEqual({ success: "Visit recorded." });
  });

  it("validates a rating before requiring the customer", async () => {
    const state = await submitRestaurantRating(
      {},
      formData({ visitId, stars: "6" }),
    );
    expect(state.fieldError).toMatch(/1 to 5/i);
    expect(requireCustomer).not.toHaveBeenCalled();
  });

  it("submits a customer-owned rating and revalidates public pages", async () => {
    rpc.mockResolvedValue({ data: customerId, error: null });
    const state = await submitRestaurantRating(
      {},
      formData({ visitId, stars: "4" }),
    );
    expect(requireCustomer).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith("submit_restaurant_rating", {
      target_visit_id: visitId,
      rating_stars: 4,
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/restaurants/${customerId}`);
    expect(state).toEqual({ success: "Rating submitted." });
  });

  it("returns safe errors from trusted operations", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("policy detail") });
    expect(await recordPaidVisit({}, formData({ customerId }))).toEqual({
      formError: "We couldn't record this visit.",
    });
    expect(
      await submitRestaurantRating({}, formData({ visitId, stars: "4" })),
    ).toEqual({
      formError: "We couldn't submit this rating.",
    });
  });

  it("validates and submits an eligible customer rating as restaurant staff", async () => {
    expect(
      await submitCustomerRating({}, formData({ visitId, stars: "0" })),
    ).toEqual({ fieldError: "Choose a rating from 1 to 5." });
    expect(requireRestaurantStaff).not.toHaveBeenCalled();

    rpc.mockResolvedValue({ data: customerId, error: null });
    expect(
      await submitCustomerRating({}, formData({ visitId, stars: "5" })),
    ).toEqual({ success: "Customer rating submitted." });
    expect(requireRestaurantStaff).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith("submit_customer_rating", {
      target_visit_id: visitId,
      rating_stars: 5,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/customer");
    expect(revalidatePath).toHaveBeenCalledWith("/restaurant/visits");
  });

  it("hides trusted customer-rating errors", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("private detail") });
    expect(
      await submitCustomerRating({}, formData({ visitId, stars: "4" })),
    ).toEqual({ formError: "We couldn't submit this customer rating." });
  });
});
