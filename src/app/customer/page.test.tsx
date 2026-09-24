import { render, screen } from "@testing-library/react";
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

import CustomerPage from "./page";

function customerClient({
  profile = { first_name: "Ada", last_name: "Lovelace" },
  user = { id: "customer-id", email: "ada@example.com" },
}: {
  profile?: { first_name: string; last_name: string } | null;
  user?: { id: string; email: string } | null;
} = {}) {
  const single = vi.fn().mockResolvedValue({
    data: profile,
    error: profile ? null : new Error("Profile not found"),
  });
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error("Not authenticated"),
      }),
      signOut,
    },
    from: vi.fn(() => ({ select })),
  };
}

describe("customer home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the authenticated customer's identity and sign-out control", async () => {
    createClient.mockResolvedValue(customerClient());

    render(await CustomerPage());

    expect(
      screen.getByRole("heading", { name: "Welcome, Ada." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Signed in as ada@example.com"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("redirects an unauthenticated visitor to login", async () => {
    createClient.mockResolvedValue(customerClient({ user: null }));

    await expect(CustomerPage()).rejects.toThrow("redirect:/login");
  });

  it("clears the session when the linked profile is missing", async () => {
    createClient.mockResolvedValue(customerClient({ profile: null }));

    await expect(CustomerPage()).rejects.toThrow(
      "redirect:/login?error=profile",
    );
    expect(signOut).toHaveBeenCalledOnce();
  });
});
