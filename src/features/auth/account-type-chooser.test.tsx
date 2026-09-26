import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AccountTypeChooser } from "./account-type-chooser";

describe("AccountTypeChooser", () => {
  it("offers each supported account type from one screen", () => {
    render(<AccountTypeChooser />);

    expect(
      screen.getByRole("link", { name: "Create customer account" }),
    ).toHaveAttribute("href", "/signup/customer");
    expect(
      screen.getByRole("link", { name: "Create owner account" }),
    ).toHaveAttribute("href", "/restaurant/signup");
    expect(
      screen.getByRole("link", { name: "Create employee account" }),
    ).toHaveAttribute("href", "/employee/signup");
  });
});
