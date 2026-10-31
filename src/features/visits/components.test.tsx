import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  deleteRestaurantReview: vi.fn(),
  recordPaidVisit: vi.fn(),
  submitCustomerRating: vi.fn(),
  submitRestaurantRating: vi.fn(),
  updateRestaurantReview: vi.fn(),
}));

import {
  CustomerRatingForm,
  CustomerRatingSummaryDisplay,
  RecordVisitControl,
  RestaurantRatingForm,
} from "./components";

afterEach(cleanup);

describe("visit controls", () => {
  it("requires confirmation before recording a selected customer", () => {
    render(
      <RecordVisitControl
        customer={{
          userId: "customer-id",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          averageRating: null,
          ratingCount: 0,
        }}
      />,
    );
    expect(screen.getByText("Select customer")).toBeInTheDocument();
    expect(
      screen.getByText(/Record a paid visit for Ada Lovelace/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm visit" }),
    ).toBeInTheDocument();
  });

  it("renders the exact private aggregate and empty state accessibly", () => {
    const { rerender } = render(
      <CustomerRatingSummaryDisplay averageRating={4.3} ratingCount={7} />,
    );
    expect(
      screen.getByLabelText("Customer rating 4.3 out of 5"),
    ).toBeInTheDocument();
    expect(screen.getByText("4.3 average")).toBeInTheDocument();
    expect(screen.getByText("7 ratings")).toBeInTheDocument();

    rerender(
      <CustomerRatingSummaryDisplay averageRating={null} ratingCount={0} />,
    );
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
    expect(screen.getByText("0 ratings")).toBeInTheDocument();
  });

  it("requires confirmation for an immutable customer rating", () => {
    render(
      <CustomerRatingForm
        visit={{
          visitId: "visit-id",
          userId: "customer-id",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          recordedAt: "2026-09-29T12:00:00Z",
          averageRating: 4.3,
          ratingCount: 7,
        }}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByText(/rating is final/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm customer rating" }),
    ).toBeInTheDocument();
  });

  it("renders accessible 1-to-5 rating and optional review controls", () => {
    const { container } = render(
      <RestaurantRatingForm
        visit={{
          visitId: "visit-id",
          restaurantId: "restaurant-id",
          restaurantName: "The Table",
          recordedAt: "2026-09-29T12:00:00Z",
          stars: null,
          reviewText: null,
          submittedAt: null,
          updatedAt: null,
        }}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(5);
    expect(screen.getByLabelText(/written review/i)).toHaveAttribute(
      "maxlength",
      "1000",
    );
    expect(
      screen.getByRole("button", { name: "Confirm rating" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/edit or delete this review later/i),
    ).toBeInTheDocument();
  });
});
