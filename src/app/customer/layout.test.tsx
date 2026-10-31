import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { loadCustomerContributionCount, loadCustomerVisits, requireCustomer } =
  vi.hoisted(() => ({
    loadCustomerContributionCount: vi.fn(),
    loadCustomerVisits: vi.fn(),
    requireCustomer: vi.fn(),
  }));

vi.mock("@/features/auth/guards", () => ({ requireCustomer }));
vi.mock("@/features/visits/data", () => ({
  loadCustomerContributionCount,
  loadCustomerVisits,
}));
vi.mock("@/features/auth/actions", () => ({ logout: vi.fn() }));

import CustomerLayout from "./layout";

describe("customer layout", () => {
  it("keeps pending activity and points visible across customer pages", async () => {
    requireCustomer.mockResolvedValue({});
    loadCustomerContributionCount.mockResolvedValue(5);
    loadCustomerVisits.mockResolvedValue([{ stars: null }, { stars: 5 }]);

    render(await CustomerLayout({ children: <p>Page content</p> }));

    expect(screen.getByRole("link", { name: "Activity (1)" })).toHaveAttribute(
      "href",
      "/customer/activity",
    );
    expect(screen.getByLabelText("50 points")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("does not misrepresent points when progress cannot load", async () => {
    requireCustomer.mockResolvedValue({});
    loadCustomerContributionCount.mockRejectedValue(new Error("unavailable"));
    loadCustomerVisits.mockResolvedValue([]);

    render(await CustomerLayout({ children: null }));

    expect(screen.getByLabelText("Points unavailable")).toBeInTheDocument();
  });
});
