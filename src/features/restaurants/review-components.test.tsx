import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PublicReviewList, ReviewPagination } from "./review-components";

afterEach(cleanup);

describe("public restaurant reviews", () => {
  it("renders review text without an author identity", () => {
    render(
      <PublicReviewList
        reviews={[
          {
            stars: 5,
            reviewText: "Excellent service.",
            submittedAt: "2026-10-01T12:00:00Z",
            updatedAt: "2026-10-01T12:00:00Z",
          },
        ]}
      />,
    );
    expect(screen.getByText("Excellent service.")).toBeInTheDocument();
    expect(screen.getByText(/anonymous customer/i)).toBeInTheDocument();
    expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
  });

  it("paginates review results on the restaurant profile", () => {
    render(
      <ReviewPagination
        restaurantId="restaurant-id"
        page={2}
        totalCount={25}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Previous reviews" }),
    ).toHaveAttribute("href", "/restaurants/restaurant-id#reviews");
    expect(screen.getByRole("link", { name: "Next reviews" })).toHaveAttribute(
      "href",
      "/restaurants/restaurant-id?reviewPage=3#reviews",
    );
  });
});
