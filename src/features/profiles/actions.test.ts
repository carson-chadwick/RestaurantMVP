import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, requireCustomer, requireRestaurantStaff, update } =
  vi.hoisted(() => ({
    revalidatePath: vi.fn(),
    requireCustomer: vi.fn(),
    requireRestaurantStaff: vi.fn(),
    update: vi.fn(),
  }));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/features/auth/guards", () => ({
  requireCustomer,
  requireRestaurantStaff,
}));

import { updateCustomerProfile, updateStaffProfile } from "./actions";

function formData(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

function authorizedAccount() {
  const eq = vi.fn().mockResolvedValue({ error: null });
  update.mockReturnValue({ eq });
  return {
    supabase: { from: vi.fn(() => ({ update })) },
    user: { id: "user-id" },
  };
}

describe("profile update actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates only the authenticated customer's profile", async () => {
    const account = authorizedAccount();
    requireCustomer.mockResolvedValue(account);

    const state = await updateCustomerProfile(
      {},
      formData({ firstName: " Ada ", lastName: " Lovelace " }),
    );

    expect(requireCustomer).toHaveBeenCalledOnce();
    expect(account.supabase.from).toHaveBeenCalledWith("customer_profiles");
    expect(update).toHaveBeenCalledWith({
      first_name: "Ada",
      last_name: "Lovelace",
    });
    expect(state).toEqual({ success: "Profile updated." });
  });

  it("updates only the authenticated staff member's profile", async () => {
    const account = authorizedAccount();
    requireRestaurantStaff.mockResolvedValue(account);

    await updateStaffProfile(
      {},
      formData({ firstName: " Pat ", lastName: " Cook " }),
    );

    expect(requireRestaurantStaff).toHaveBeenCalledOnce();
    expect(account.supabase.from).toHaveBeenCalledWith("staff_profiles");
    expect(update).toHaveBeenCalledWith({
      first_name: "Pat",
      last_name: "Cook",
    });
  });

  it("rejects invalid input before checking authorization or writing", async () => {
    const state = await updateCustomerProfile(
      {},
      formData({ firstName: "", lastName: "Valid" }),
    );

    expect(state.fieldErrors?.firstName).toBeDefined();
    expect(requireCustomer).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("returns a safe database error", async () => {
    const account = authorizedAccount();
    update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: new Error("policy denied") }),
    });
    requireRestaurantStaff.mockResolvedValue(account);

    const state = await updateStaffProfile(
      {},
      formData({ firstName: "Pat", lastName: "Cook" }),
    );

    expect(state).toEqual({ formError: "We couldn't update your profile." });
    expect(JSON.stringify(state)).not.toContain("policy denied");
  });
});
