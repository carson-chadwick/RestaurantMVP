import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "./validation";

describe("customer auth validation", () => {
  it("trims names and normalizes email during signup", () => {
    const result = signupSchema.parse({
      firstName: "  Ada ",
      lastName: " Lovelace  ",
      email: "  ADA@EXAMPLE.COM ",
      password: "secret",
      confirmPassword: "secret",
    });

    expect(result).toMatchObject({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });
  });

  it("rejects mismatched passwords and invalid customer details", () => {
    const result = signupSchema.safeParse({
      firstName: "",
      lastName: "x".repeat(51),
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        firstName: ["First name is required."],
        lastName: ["Last name must be 50 characters or fewer."],
        email: ["Enter a valid email address."],
        password: ["Password must be at least 6 characters."],
        confirmPassword: ["Passwords do not match."],
      });
    }
  });

  it("requires both login fields", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toEqual([
        "Password is required.",
      ]);
    }
  });
});
