import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { StaffSignupForm } from "./staff-signup-form";

vi.mock("./actions", () => ({
  login: vi.fn(),
  employeeSignup: vi.fn(),
  restaurantSignup: vi.fn(),
  signup: vi.fn(),
}));

afterEach(cleanup);

describe("customer auth forms", () => {
  it("renders an accessible login form and signup link", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create a customer account" }),
    ).toHaveAttribute("href", "/signup");
    expect(
      screen.getByRole("link", { name: "Create a restaurant account" }),
    ).toHaveAttribute("href", "/restaurant/signup");
    expect(
      screen.getByRole("link", { name: "Create an employee account" }),
    ).toHaveAttribute("href", "/employee/signup");
  });

  it("renders all required signup fields and a login link", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("First name")).toBeRequired();
    expect(screen.getByLabelText("Last name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByLabelText("Confirm password")).toBeRequired();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("collects a restaurant name only for owner signup", () => {
    const { unmount } = render(<StaffSignupForm accountType="owner" />);

    expect(screen.getByLabelText("Restaurant name")).toBeRequired();
    expect(
      screen.getByRole("button", { name: "Create restaurant account" }),
    ).toBeInTheDocument();

    unmount();
    render(<StaffSignupForm accountType="employee" />);

    expect(screen.queryByLabelText("Restaurant name")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create employee account" }),
    ).toBeInTheDocument();
  });
});
