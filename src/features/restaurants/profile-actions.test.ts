import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, requireRestaurantOwner, update } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireRestaurantOwner: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/features/auth/guards", () => ({ requireRestaurantOwner }));

import { updateRestaurantProfile } from "./profile-actions";
import { weekDays } from "./profile";

function profileForm(overrides: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({
    restaurantName: " The New Table ",
    address: " 123 Main St ",
    phone: " (801) 555-0100 ",
    description: " A neighborhood restaurant. ",
    ...overrides,
  }).forEach(([key, value]) => data.set(key, value));
  weekDays.forEach((day) => data.set(`${day}Closed`, "on"));
  return data;
}

function authorizedAccount(error: unknown = null) {
  const eq = vi.fn().mockResolvedValue({ error });
  update.mockReturnValue({ eq });
  return {
    supabase: { from: vi.fn(() => ({ update })) },
    user: { id: "owner-id" },
  };
}

describe("restaurant profile action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires an owner and updates only their restaurant", async () => {
    const account = authorizedAccount();
    requireRestaurantOwner.mockResolvedValue(account);

    const state = await updateRestaurantProfile({}, profileForm());

    expect(requireRestaurantOwner).toHaveBeenCalledOnce();
    expect(account.supabase.from).toHaveBeenCalledWith("restaurants");
    expect(update).toHaveBeenCalledWith({
      name: "The New Table",
      address: "123 Main St",
      phone: "(801) 555-0100",
      description: "A neighborhood restaurant.",
      weekly_hours: null,
    });
    expect(state).toEqual({ success: "Restaurant updated." });
    expect(revalidatePath).toHaveBeenCalledWith("/restaurant/profile");
  });

  it("stores a complete weekly schedule", async () => {
    const account = authorizedAccount();
    requireRestaurantOwner.mockResolvedValue(account);
    const data = profileForm();
    data.delete("mondayClosed");
    data.set("mondayOpen", "09:00");
    data.set("mondayClose", "17:00");

    await updateRestaurantProfile({}, data);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        weekly_hours: expect.objectContaining({
          monday: { open: "09:00", close: "17:00" },
          sunday: { closed: true },
        }),
      }),
    );
  });

  it("rejects invalid hours before authorization", async () => {
    const data = profileForm();
    data.delete("mondayClosed");
    data.set("mondayOpen", "17:00");
    data.set("mondayClose", "09:00");

    const state = await updateRestaurantProfile({}, data);

    expect(state.hoursError).toMatch(/later/i);
    expect(requireRestaurantOwner).not.toHaveBeenCalled();
  });

  it("returns a safe database error", async () => {
    requireRestaurantOwner.mockResolvedValue(
      authorizedAccount(new Error("policy denied")),
    );
    const state = await updateRestaurantProfile({}, profileForm());
    expect(state).toEqual({ formError: "We couldn't update your restaurant." });
    expect(JSON.stringify(state)).not.toContain("policy denied");
  });
});
