import { describe, expect, it } from "vitest";

import {
  accountEmail,
  demoCustomers,
  demoRestaurants,
  demoScenarios,
} from "./seed-demo.mjs";

describe("demo data manifest", () => {
  it("uses clearly fictional, unique account identities", () => {
    const emails = [
      ...demoRestaurants.flatMap((restaurant) => [
        accountEmail("owner", restaurant.key),
        accountEmail("employee", restaurant.key),
      ]),
      ...demoCustomers.map((customer) =>
        accountEmail("customer", customer.key),
      ),
    ];
    expect(new Set(emails).size).toBe(12);
    expect(emails.every((email) => email.endsWith("@example.com"))).toBe(true);
    expect(
      demoRestaurants.every((restaurant) => restaurant.name.includes("(Demo)")),
    ).toBe(true);
  });

  it("covers pending, ready, complete, and multiple aggregate stories", () => {
    expect(new Set(demoScenarios.map((scenario) => scenario.state))).toEqual(
      new Set(["awaiting", "ready", "complete"]),
    );
    expect(
      demoScenarios.filter((scenario) => scenario.state === "complete").length,
    ).toBeGreaterThan(1);
    expect(
      demoCustomers.some(
        (customer) =>
          demoScenarios.filter((scenario) => scenario.customer === customer.key)
            .length > 1,
      ),
    ).toBe(true);
  });
});
