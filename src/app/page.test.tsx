import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/public-account-navigation", () => ({
  PublicAccountNavigation: vi.fn(async () => (
    <nav aria-label="Account navigation">
      <Link href="/restaurants">Browse restaurants</Link>
      <Link href="/signup">Create customer account</Link>
      <Link href="/restaurant/signup">Create restaurant account</Link>
      <Link href="/login">Sign in</Link>
    </nav>
  )),
}));

import Home from "./page";

describe("Home", () => {
  it("introduces the Dining Plus application", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", {
        name: /better hospitality starts with trust/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dining Plus")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create customer account" }),
    ).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "Create restaurant account" }),
    ).toHaveAttribute("href", "/restaurant/signup");
    expect(
      screen.getByRole("link", { name: "Browse restaurants" }),
    ).toHaveAttribute("href", "/restaurants");
  });
});
