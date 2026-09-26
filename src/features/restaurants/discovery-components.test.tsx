import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RestaurantCard, RestaurantPagination } from "./discovery-components";
import { emptyRatingSummary, type RestaurantProfile } from "./profile";

afterEach(cleanup);

const restaurant: RestaurantProfile = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  name: "The Test Table",
  address: "123 Main St",
  phone: null,
  description: "A neighborhood restaurant.",
  weeklyHours: null,
  ratingSummary: emptyRatingSummary,
};

describe("restaurant discovery components", () => {
  it("renders a safe restaurant card and empty rating display", () => {
    render(<RestaurantCard restaurant={restaurant} />);
    expect(screen.getByRole("link", { name: restaurant.name })).toHaveAttribute(
      "href",
      `/restaurants/${restaurant.id}`,
    );
    expect(screen.getByText(restaurant.address!)).toBeInTheDocument();
    expect(
      screen.getByLabelText("No customer ratings yet"),
    ).toBeInTheDocument();
    expect(screen.getByText("0 ratings")).toBeInTheDocument();
  });

  it("preserves search terms in previous and next links", () => {
    render(
      <RestaurantPagination page={2} search="Test Table" totalCount={40} />,
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/restaurants?q=Test+Table",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/restaurants?q=Test+Table&page=3",
    );
  });
});
