import { describe, expect, it } from "vitest";

import {
  customerSearchSchema,
  normalizeVisitPage,
  starsSchema,
} from "./validation";

describe("visit validation", () => {
  it("requires both names or neither for customer search", () => {
    expect(
      customerSearchSchema.safeParse({ firstName: "", lastName: "" }).success,
    ).toBe(true);
    expect(
      customerSearchSchema.safeParse({
        firstName: " Ada ",
        lastName: " Lovelace ",
      }).success,
    ).toBe(true);
    expect(
      customerSearchSchema.safeParse({ firstName: "Ada", lastName: "" })
        .success,
    ).toBe(false);
  });

  it("accepts only integer ratings from 1 through 5", () => {
    expect(starsSchema.parse("5")).toBe(5);
    expect(starsSchema.safeParse("0").success).toBe(false);
    expect(starsSchema.safeParse("6").success).toBe(false);
  });

  it("normalizes invalid pages to the first page", () => {
    expect(normalizeVisitPage("2")).toBe(2);
    expect(normalizeVisitPage("-1")).toBe(1);
    expect(normalizeVisitPage("bad")).toBe(1);
  });
});
