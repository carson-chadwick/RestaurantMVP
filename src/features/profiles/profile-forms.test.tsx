import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  updateCustomerProfile: vi.fn(),
  updateStaffProfile: vi.fn(),
}));

import { PersonalProfileForm } from "./profile-forms";

afterEach(cleanup);

describe("profile forms", () => {
  it("renders editable names and a read-only email", () => {
    render(
      <PersonalProfileForm
        accountType="customer"
        email="ada@example.com"
        firstName="Ada"
        lastName="Lovelace"
      />,
    );

    expect(screen.getByLabelText("First name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Last name")).toHaveValue("Lovelace");
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Email")).toHaveAttribute("readonly");
    expect(
      screen.getByRole("button", { name: "Save personal profile" }),
    ).toBeInTheDocument();
  });
});
