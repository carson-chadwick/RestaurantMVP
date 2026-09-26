import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RootLayout from "./layout";

describe("root layout", () => {
  it("includes the global privacy policy link", () => {
    render(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>,
    );
    expect(
      screen.getByRole("link", { name: "Privacy policy" }),
    ).toHaveAttribute("href", "/privacy");
  });
});
