import { describe, expect, it } from "vitest";

import {
  loginSchema,
  restaurantSignupSchema,
  signupSchema,
} from "./validation";

describe("customer auth validation", () => {
  it("trims names and normalizes email during signup", () => {
    const result = signupSchema.parse({
      firstName: "  Ada ",
      lastName: " Lovelace  ",
      email: "  ADA@EXAMPLE.COM ",
      password: "secret",
      confirmPassword: "secret",
      privacyAcknowledged: true,
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
      privacyAcknowledged: true,
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

  it("requires the customer privacy acknowledgement", () => {
    const result = signupSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "secret",
      confirmPassword: "secret",
      privacyAcknowledged: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.privacyAcknowledged).toEqual([
        "You must acknowledge the privacy notice to create an account.",
      ]);
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

  it("normalizes and validates a restaurant name", () => {
    const valid = restaurantSignupSchema.parse({
      firstName: " Grace ",
      lastName: " Hopper ",
      restaurantName: "  The Compiler Cafe  ",
      email: "OWNER@EXAMPLE.COM",
      password: "secret",
      confirmPassword: "secret",
    });

    expect(valid.restaurantName).toBe("The Compiler Cafe");
    expect(valid.email).toBe("owner@example.com");

    const invalid = restaurantSignupSchema.safeParse({
      ...valid,
      restaurantName: "x",
    });
    expect(invalid.success).toBe(false);
  });
});
