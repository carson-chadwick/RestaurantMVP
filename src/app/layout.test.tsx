import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Cormorant_Garamond: () => ({ variable: "font-serif" }),
  Plus_Jakarta_Sans: () => ({ variable: "font-sans" }),
}));

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
