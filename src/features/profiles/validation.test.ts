import { describe, expect, it } from "vitest";

import { personalProfileSchema } from "./validation";

describe("profile validation", () => {
  it("trims valid personal names", () => {
    expect(
      personalProfileSchema.parse({
        firstName: " Ada ",
        lastName: " Lovelace ",
      }),
    ).toEqual({ firstName: "Ada", lastName: "Lovelace" });
  });

  it("rejects missing or oversized personal names", () => {
    const result = personalProfileSchema.safeParse({
      firstName: "",
      lastName: "x".repeat(51),
    });
    expect(result.success).toBe(false);
  });
});
