import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("introduces the Dining Plus application", () => {
    render(<Home />);

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
  });
});
