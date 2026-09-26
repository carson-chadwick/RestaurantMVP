import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, getAccountDestination, getUser } = vi.hoisted(() => ({
  createClient: vi.fn(),
  getAccountDestination: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("./role", () => ({ getAccountDestination }));

import { PublicAccountNavigation } from "./public-account-navigation";

describe("PublicAccountNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({ auth: { getUser } });
  });
  afterEach(cleanup);

  it("shows public account actions to anonymous visitors", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    render(
      await PublicAccountNavigation({
        includeBrowse: true,
        includeSignupAction: true,
      }),
    );

    expect(
      screen.getByRole("link", { name: "Browse restaurants" }),
    ).toHaveAttribute("href", "/restaurants");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toHaveAttribute("href", "/signup");
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
    expect(getAccountDestination).not.toHaveBeenCalled();
  });

  it("shows customer home and sign out while hiding account creation", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "customer-id" } } });
    getAccountDestination.mockResolvedValue("/customer");

    render(
      await PublicAccountNavigation({
        includeBrowse: true,
        includeSignupAction: true,
      }),
    );

    expect(screen.getByRole("link", { name: "Customer home" })).toHaveAttribute(
      "href",
      "/customer",
    );
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign in" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/create .* account/i)).not.toBeInTheDocument();
  });

  it.each(["restaurant_owner", "restaurant_employee"])(
    "shows the restaurant portal to an authenticated %s",
    async () => {
      getUser.mockResolvedValue({ data: { user: { id: "staff-id" } } });
      getAccountDestination.mockResolvedValue("/restaurant");

      render(await PublicAccountNavigation({}));

      expect(
        screen.getByRole("link", { name: "Restaurant portal" }),
      ).toHaveAttribute("href", "/restaurant");
      expect(
        screen.getByRole("button", { name: "Sign out" }),
      ).toBeInTheDocument();
    },
  );

  it("offers sign out without an incorrect portal link when the role is missing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "unknown-id" } } });
    getAccountDestination.mockResolvedValue(null);

    render(await PublicAccountNavigation({}));

    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
