import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, redirect, signInWithPassword, signOut, signUp } =
  vi.hoisted(() => ({
    createClient: vi.fn(),
    redirect: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));

import { login, logout, signup } from "./actions";

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
      }),
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret",
      options: {
        data: {
          account_type: "customer",
          first_name: "Ada",
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
      }),
    );

    expect(state.formError).toBe(
      "We couldn't create your account. Check your information or try signing in.",
    );
    expect(state.formError).not.toContain("already registered");
  });

  it("signs in with normalized credentials", async () => {
    signInWithPassword.mockResolvedValue({ error: null });

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
