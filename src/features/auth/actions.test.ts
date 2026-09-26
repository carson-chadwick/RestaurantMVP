import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createClient,
  getAccountDestination,
  redirect,
  signInWithPassword,
  signOut,
  signUp,
} = vi.hoisted(() => ({
  createClient: vi.fn(),
  getAccountDestination: vi.fn(),
  redirect: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("./role", () => ({ getAccountDestination }));

import {
  employeeSignup,
  login,
  logout,
  restaurantSignup,
  signup,
} from "./actions";

function formData(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("customer auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({
      auth: { signInWithPassword, signOut, signUp },
    });
    getAccountDestination.mockResolvedValue("/customer");
  });

  it("creates a customer with normalized auth metadata", async () => {
    signUp.mockResolvedValue({ error: null });

    await signup(
      {},
      formData({
        firstName: " Ada ",
        lastName: " Lovelace ",
        email: " ADA@EXAMPLE.COM ",
        password: "secret",
        confirmPassword: "secret",
        privacyAcknowledged: "on",
      }),
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret",
      options: {
        data: {
          account_type: "customer",
          first_name: "Ada",
          identity_disclosure_acknowledged: true,
          last_name: "Lovelace",
        },
      },
    });
    expect(redirect).toHaveBeenCalledWith("/customer");
  });

  it("does not call Supabase when signup validation fails", async () => {
    const state = await signup(
      {},
      formData({
        firstName: "",
        lastName: "Customer",
        email: "invalid",
        password: "123",
        confirmPassword: "456",
      }),
    );

    expect(state.fieldErrors).toBeDefined();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns a safe signup error without exposing provider details", async () => {
    signUp.mockResolvedValue({ error: new Error("User already registered") });

    const state = await signup(
      {},
      formData({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: "secret",
        confirmPassword: "secret",
        privacyAcknowledged: "on",
      }),
    );

    expect(state.formError).toBe(
      "We couldn't create your account. Check your information or try signing in.",
    );
    expect(state.formError).not.toContain("already registered");
  });

  it("creates a restaurant owner and restaurant atomically through metadata", async () => {
    signUp.mockResolvedValue({ error: null });

    await restaurantSignup(
      {},
      formData({
        firstName: "Julia",
        lastName: "Child",
        restaurantName: "The French Table",
        email: "owner@example.com",
        password: "secret",
        confirmPassword: "secret",
      }),
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "secret",
      options: {
        data: {
          account_type: "restaurant_owner",
          first_name: "Julia",
          last_name: "Child",
          restaurant_name: "The French Table",
        },
      },
    });
    expect(redirect).toHaveBeenCalledWith("/restaurant");
  });

  it("creates an unassigned employee account", async () => {
    signUp.mockResolvedValue({ error: null });

    await employeeSignup(
      {},
      formData({
        firstName: "Alex",
        lastName: "Server",
        email: "employee@example.com",
        password: "secret",
        confirmPassword: "secret",
      }),
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "employee@example.com",
      password: "secret",
      options: {
        data: {
          account_type: "restaurant_employee",
          first_name: "Alex",
          last_name: "Server",
        },
      },
    });
    expect(redirect).toHaveBeenCalledWith("/restaurant");
  });

  it("signs in with normalized credentials", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "customer-id" } },
      error: null,
    });

    await login(
      {},
      formData({ email: " CUSTOMER@EXAMPLE.COM ", password: "secret" }),
    );

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "customer@example.com",
      password: "secret",
    });
    expect(redirect).toHaveBeenCalledWith("/customer");
  });

  it("redirects restaurant staff based on their trusted role", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "owner-id" } },
      error: null,
    });
    getAccountDestination.mockResolvedValue("/restaurant");

    await login(
      {},
      formData({ email: "owner@example.com", password: "secret" }),
    );

    expect(getAccountDestination).toHaveBeenCalledWith(
      expect.anything(),
      "owner-id",
    );
    expect(redirect).toHaveBeenCalledWith("/restaurant");
  });

  it("clears a session whose account has no trusted role", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "unknown-id" } },
      error: null,
    });
    getAccountDestination.mockResolvedValue(null);
    signOut.mockResolvedValue({ error: null });

    const state = await login(
      {},
      formData({ email: "unknown@example.com", password: "secret" }),
    );

    expect(signOut).toHaveBeenCalledOnce();
    expect(state.formError).toMatch(/determine access/i);
  });

  it("returns a generic invalid-credentials error", async () => {
    signInWithPassword.mockResolvedValue({
      error: new Error("Invalid login credentials"),
    });

    const state = await login(
      {},
      formData({ email: "customer@example.com", password: "wrong-password" }),
    );

    expect(state).toEqual({ formError: "Email or password is incorrect." });
  });

  it("signs out and returns to login", async () => {
    signOut.mockResolvedValue({ error: null });

    await logout();

    expect(signOut).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
