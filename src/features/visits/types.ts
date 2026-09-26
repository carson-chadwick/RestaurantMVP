export type CustomerDirectoryRow = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  averageRating: number | null;
  ratingCount: number;
};

export type StaffVisit = {
  visitId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  recordedAt: string;
  ratingStatus:
    "awaiting_customer_rating" | "ready_to_rate_customer" | "customer_rated";
};

export type EligibleCustomerRatingVisit = CustomerDirectoryRow & {
  visitId: string;
  recordedAt: string;
};

export type CustomerVisit = {
  visitId: string;
  restaurantId: string;
  restaurantName: string;
  recordedAt: string;
  stars: number | null;
  submittedAt: string | null;
};

export type CustomerRatingSummary = {
  averageRating: number | null;
  ratingCount: number;
};

export type CustomerRatingHistory = {
  visitId: string;
  restaurantId: string;
  restaurantName: string;
  recordedAt: string;
  stars: number;
  submittedAt: string;
};

export type VisitActionState = {
  fieldError?: string;
  formError?: string;
  success?: string;
};
