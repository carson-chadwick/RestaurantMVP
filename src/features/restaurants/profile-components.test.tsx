import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./profile-actions", () => ({ updateRestaurantProfile: vi.fn() }));

import { RestaurantProfileForm } from "./profile-components";
import { emptyRatingSummary, type RestaurantProfile } from "./profile";

afterEach(cleanup);

const profile: RestaurantProfile = {
  id: "restaurant-id",
  name: "The Test Table",
  address: "123 Main St",
  phone: "801-555-0100",
  description: "Dinner every night.",
  weeklyHours: null,
  ratingSummary: emptyRatingSummary,
};

describe("restaurant profile components", () => {
  it("renders every owner-editable field and seven days of hours", () => {
    render(<RestaurantProfileForm profile={profile} />);
    expect(screen.getByLabelText("Restaurant name")).toHaveValue(profile.name);
    expect(screen.getByLabelText("Address")).toHaveValue(profile.address);
    expect(screen.getByLabelText("Phone")).toHaveValue(profile.phone);
    expect(screen.getByLabelText("Description")).toHaveValue(
      profile.description,
    );
    expect(screen.getAllByText("Closed")).toHaveLength(7);
  });

  it("shows the Phase 3 empty rating contract", () => {
    render(<RestaurantProfileForm profile={profile} />);
    expect(screen.getByText("No ratings yet")).toBeInTheDocument();
    expect(screen.getByText("0 ratings")).toBeInTheDocument();
  });
});
