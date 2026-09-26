import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/public-account-navigation", () => ({
  PublicAccountNavigation: vi.fn(async () => (
    <nav aria-label="Account navigation">
      <Link href="/customer">Customer home</Link>
      <button type="button">Sign out</button>
    </nav>
  )),
}));

import PrivacyPage from "./page";

describe("privacy policy", () => {
  it("explains identity, visit, and rating privacy", async () => {
    render(await PrivacyPage());
    expect(
      screen.getByRole("heading", { name: "Privacy policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/names and email addresses/i)).toBeInTheDocument();
    expect(screen.getByText(/restaurant rating averages/i)).toBeInTheDocument();
    expect(
      screen.getByText(/customer reputation information is private/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Customer home" })).toHaveAttribute(
      "href",
      "/customer",
    );
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });
});
