import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/public-account-navigation", () => ({
  PublicAccountNavigation: vi.fn(async () => (
    <nav aria-label="Account navigation">
      <Link href="/restaurants">Browse restaurants</Link>
      <Link href="/signup">Create account</Link>
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
        name: /better guests\. better restaurants/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Dining Plus home" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("heading", { name: /reputation goes both ways/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Create account" }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: "Create account" })[0],
    ).toHaveAttribute("href", "/signup");
    expect(screen.getAllByRole("link", { name: "Sign in" })[0]).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getAllByRole("link", { name: "Browse restaurants" })[0],
    ).toHaveAttribute("href", "/restaurants");
  });
});
