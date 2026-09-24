import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { requireCustomer } = vi.hoisted(() => ({ requireCustomer: vi.fn() }));

vi.mock("@/features/auth/guards", () => ({ requireCustomer }));
vi.mock("@/features/profiles/actions", () => ({
  updateCustomerProfile: vi.fn(),
  updateRestaurantProfile: vi.fn(),
  updateStaffProfile: vi.fn(),
}));

import CustomerProfilePage from "./page";

describe("customer profile page", () => {
  it("shows the customer's editable name and read-only email", async () => {
    const result = Promise.resolve({
      data: { first_name: "Ada", last_name: "Lovelace" },
      error: null,
    });
    const query = {
      eq: vi.fn(() => ({ single: vi.fn(() => result) })),
    };
    requireCustomer.mockResolvedValue({
      user: { id: "customer-id", email: "ada@example.com" },
      supabase: {
        auth: { signOut: vi.fn() },
        from: vi.fn(() => ({ select: vi.fn(() => query) })),
      },
    });

    render(await CustomerProfilePage());

    expect(screen.getByLabelText("First name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Last name")).toHaveValue("Lovelace");
    expect(screen.getByLabelText("Email")).toHaveAttribute("readonly");
  });
});
