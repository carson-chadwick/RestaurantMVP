import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, redirect, signOut } = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));

import {
  requireCustomer,
  requireRestaurantOwner,
  requireRestaurantStaff,
} from "./guards";

function clientFor(
  role?: "customer" | "restaurant_owner" | "restaurant_employee",
) {
  const single = vi.fn().mockResolvedValue({
    data: role ? { role } : null,
    error: role ? null : new Error("Missing role"),
  });
  const query = { eq: vi.fn(() => ({ single })) };
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-id", email: "user@example.com" } },
        error: null,
      }),
      signOut,
    },
    from: vi.fn(() => ({ select: vi.fn(() => query) })),
  };
}

describe("trusted account guards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the verified account for an allowed role", async () => {
    const client = clientFor("customer");
    createClient.mockResolvedValue(client);

    const account = await requireCustomer();

    expect(account.role).toBe("customer");
    expect(account.user.id).toBe("user-id");
  });

  it("redirects unauthenticated users to login", async () => {
    const client = clientFor("customer");
    client.auth.getUser.mockResolvedValue({
      data: { user: null as never },
      error: new Error("No session"),
    });
    createClient.mockResolvedValue(client);

    await expect(requireCustomer()).rejects.toThrow("redirect:/login");
  });

  it("redirects valid cross-role sessions to their own portal", async () => {
    createClient.mockResolvedValue(clientFor("restaurant_employee"));
    await expect(requireCustomer()).rejects.toThrow("redirect:/restaurant");

    createClient.mockResolvedValue(clientFor("customer"));
    await expect(requireRestaurantStaff()).rejects.toThrow(
      "redirect:/customer",
    );
  });

  it("allows both staff roles but keeps owner-only access exclusive", async () => {
    createClient.mockResolvedValue(clientFor("restaurant_employee"));
    await expect(requireRestaurantStaff()).resolves.toMatchObject({
      role: "restaurant_employee",
    });

    createClient.mockResolvedValue(clientFor("restaurant_employee"));
    await expect(requireRestaurantOwner()).rejects.toThrow(
      "redirect:/restaurant",
    );
  });

  it("clears sessions with missing trusted role data", async () => {
    createClient.mockResolvedValue(clientFor());

    await expect(requireCustomer()).rejects.toThrow(
      "redirect:/login?error=access",
    );
    expect(signOut).toHaveBeenCalledOnce();
  });
});
