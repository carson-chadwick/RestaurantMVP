import {
  requireCustomer,
  requireRestaurantStaff,
} from "@/features/auth/guards";

import type {
  CustomerDirectoryRow,
  CustomerRatingHistory,
  CustomerRatingSummary,
  CustomerVisit,
  EligibleCustomerRatingVisit,
  StaffVisit,
} from "./types";

export const CUSTOMERS_PER_PAGE = 20;

export async function loadStaffVisitWorkspace(
  firstName: string,
  lastName: string,
  page: number,
  ratingPage = 1,
) {
  const { supabase } = await requireRestaurantStaff();
  const [customersResult, visitsResult, ratingQueueResult] = await Promise.all([
    supabase.rpc("list_customers_for_visit", {
      search_first_name: firstName || undefined,
      search_last_name: lastName || undefined,
      result_limit: CUSTOMERS_PER_PAGE,
      result_offset: (page - 1) * CUSTOMERS_PER_PAGE,
    }),
    supabase.rpc("list_staff_recent_visits"),
    supabase.rpc("list_staff_customer_rating_queue", {
      result_limit: CUSTOMERS_PER_PAGE,
      result_offset: (ratingPage - 1) * CUSTOMERS_PER_PAGE,
    }),
  ]);

  if (customersResult.error || visitsResult.error || ratingQueueResult.error) {
    throw new Error("staff_visits_unavailable");
  }

  const customerRows = customersResult.data ?? [];
  return {
    customers: customerRows.map((row): CustomerDirectoryRow => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      averageRating:
        row.average_rating === null ? null : Number(row.average_rating),
      ratingCount: Number(row.rating_count),
    })),
    totalCount: customerRows[0]?.total_count ?? 0,
    recentVisits: (visitsResult.data ?? []).map((row): StaffVisit => ({
      visitId: row.visit_id,
      userId: row.customer_user_id,
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      email: row.customer_email,
      recordedAt: row.recorded_at,
      ratingStatus: row.rating_status as StaffVisit["ratingStatus"],
    })),
    ratingQueue: (ratingQueueResult.data ?? []).map(
      (row): EligibleCustomerRatingVisit => ({
        visitId: row.visit_id,
        userId: row.customer_user_id,
        firstName: row.customer_first_name,
        lastName: row.customer_last_name,
        email: row.customer_email,
        recordedAt: row.recorded_at,
        averageRating:
          row.average_rating === null ? null : Number(row.average_rating),
        ratingCount: Number(row.rating_count),
      }),
    ),
    ratingQueueTotalCount: Number(
      ratingQueueResult.data?.[0]?.total_count ?? 0,
    ),
  };
}

export async function loadCustomerVisits(): Promise<CustomerVisit[]> {
  const { supabase } = await requireCustomer();
  const { data, error } = await supabase.rpc("list_customer_restaurant_visits");
  if (error) throw new Error("customer_visits_unavailable");

  return (data ?? []).map((row) => ({
    visitId: row.visit_id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name,
    recordedAt: row.recorded_at,
    stars: row.stars,
    submittedAt: row.submitted_at,
  }));
}

export async function loadCustomerReputation(): Promise<{
  summary: CustomerRatingSummary;
  history: CustomerRatingHistory[];
}> {
  const { supabase } = await requireCustomer();
  const [summaryResult, historyResult] = await Promise.all([
    supabase.rpc("get_customer_rating_summary"),
    supabase.rpc("list_customer_rating_history"),
  ]);
  if (summaryResult.error || historyResult.error) {
    throw new Error("customer_reputation_unavailable");
  }

  const summary = summaryResult.data?.[0];
  return {
    summary: {
      averageRating:
        summary?.average_rating === null ||
        summary?.average_rating === undefined
          ? null
          : Number(summary.average_rating),
      ratingCount: Number(summary?.rating_count ?? 0),
    },
    history: (historyResult.data ?? []).map((row) => ({
      visitId: row.visit_id,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurant_name,
      recordedAt: row.recorded_at,
      stars: row.stars,
      submittedAt: row.submitted_at,
    })),
  };
}
