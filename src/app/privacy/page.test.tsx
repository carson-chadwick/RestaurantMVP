import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage from "./page";

describe("privacy policy", () => {
  it("explains identity, visit, and rating privacy", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { name: "Privacy policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/names and email addresses/i)).toBeInTheDocument();
    expect(screen.getByText(/restaurant rating averages/i)).toBeInTheDocument();
    expect(
      screen.getByText(/customer reputation information is private/i),
    ).toBeInTheDocument();
  });
});
