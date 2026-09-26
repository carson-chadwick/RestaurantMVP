import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loadStaffVisitWorkspace } = vi.hoisted(() => ({
  loadStaffVisitWorkspace: vi.fn(),
}));

vi.mock("@/features/visits/data", () => ({
  CUSTOMERS_PER_PAGE: 20,
  loadStaffVisitWorkspace,
}));
vi.mock("@/features/visits/actions", () => ({
  recordPaidVisit: vi.fn(),
  submitCustomerRating: vi.fn(),
  submitRestaurantRating: vi.fn(),
}));

import StaffVisitsPage from "./page";

describe("staff visit workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadStaffVisitWorkspace.mockResolvedValue({
      customers: [
        {
          userId: "customer-id",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          averageRating: 4.5,
          ratingCount: 2,
        },
      ],
      totalCount: 1,
      recentVisits: [
        {
          visitId: "visit-id",
          userId: "customer-id",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          recordedAt: "2026-09-29T12:00:00Z",
          ratingStatus: "ready_to_rate_customer",
        },
      ],
      ratingQueue: [
        {
          visitId: "visit-id",
          userId: "customer-id",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          recordedAt: "2026-09-29T12:00:00Z",
          averageRating: 4.5,
          ratingCount: 2,
        },
      ],
      ratingQueueTotalCount: 1,
    });
  });
  afterEach(cleanup);

  it("shows recent customers and visit status", async () => {
    render(await StaffVisitsPage({ searchParams: Promise.resolve({}) }));
    expect(loadStaffVisitWorkspace).toHaveBeenCalledWith("", "", 1, 1);
    expect(screen.getAllByText("Ada Lovelace")).toHaveLength(3);
    expect(screen.getAllByText(/ada@example.com/)).not.toHaveLength(0);
    expect(screen.getByText("Ready to rate customer")).toBeInTheDocument();
    expect(screen.getByText("Customers ready to rate")).toBeInTheDocument();
    expect(screen.getAllByText("4.5 average")).toHaveLength(2);
  });

  it("distinguishes all three visit rating states", async () => {
    loadStaffVisitWorkspace.mockResolvedValue({
      customers: [],
      totalCount: 0,
      ratingQueue: [],
      ratingQueueTotalCount: 0,
      recentVisits: [
        {
          visitId: "awaiting-id",
          userId: "customer-id-1",
          firstName: "A",
          lastName: "Customer",
          email: "a@example.com",
          recordedAt: "2026-09-29T12:00:00Z",
          ratingStatus: "awaiting_customer_rating",
        },
        {
          visitId: "ready-id",
          userId: "customer-id-2",
          firstName: "B",
          lastName: "Customer",
          email: "b@example.com",
          recordedAt: "2026-09-29T12:00:00Z",
          ratingStatus: "ready_to_rate_customer",
        },
        {
          visitId: "rated-id",
          userId: "customer-id-3",
          firstName: "C",
          lastName: "Customer",
          email: "c@example.com",
          recordedAt: "2026-09-29T12:00:00Z",
          ratingStatus: "customer_rated",
        },
      ],
    });

    render(await StaffVisitsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Awaiting customer rating")).toBeInTheDocument();
    expect(screen.getByText("Ready to rate customer")).toBeInTheDocument();
    expect(screen.getByText("Customer rated")).toBeInTheDocument();
  });

  it("normalizes exact-name search and reports partial search input", async () => {
    render(
      await StaffVisitsPage({
        searchParams: Promise.resolve({
          firstName: " Ada ",
          lastName: " Lovelace ",
          page: "2",
        }),
      }),
    );
    expect(loadStaffVisitWorkspace).toHaveBeenCalledWith(
      "Ada",
      "Lovelace",
      2,
      1,
    );
    cleanup();
    render(
      await StaffVisitsPage({
        searchParams: Promise.resolve({ firstName: "Ada" }),
      }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/both first and last/i);
  });

  it("shows a safe loading error", async () => {
    loadStaffVisitWorkspace.mockRejectedValue(new Error("private detail"));
    render(await StaffVisitsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /couldn't load visit tools/i,
    );
  });
});
