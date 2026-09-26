"use server";

import { revalidatePath } from "next/cache";

import {
  requireCustomer,
  requireRestaurantStaff,
} from "@/features/auth/guards";

import type { VisitActionState } from "./types";
import { customerIdSchema, starsSchema, visitIdSchema } from "./validation";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function recordPaidVisit(
  _previousState: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  const customerId = customerIdSchema.safeParse(
    formValue(formData, "customerId"),
  );
  if (!customerId.success) return { formError: "Select a valid customer." };

  const { supabase } = await requireRestaurantStaff();
  const { error } = await supabase.rpc("record_paid_visit", {
    target_customer_user_id: customerId.data,
  });
  if (error) return { formError: "We couldn't record this visit." };

  revalidatePath("/restaurant");
  revalidatePath("/restaurant/visits");
  revalidatePath("/customer");
  return { success: "Visit recorded." };
}

export async function submitRestaurantRating(
  _previousState: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  const visitId = visitIdSchema.safeParse(formValue(formData, "visitId"));
  const stars = starsSchema.safeParse(formValue(formData, "stars"));
  if (!visitId.success) return { formError: "This visit is invalid." };
  if (!stars.success) return { fieldError: "Choose a rating from 1 to 5." };

  const { supabase } = await requireCustomer();
  const { data: restaurantId, error } = await supabase.rpc(
    "submit_restaurant_rating",
    { target_visit_id: visitId.data, rating_stars: stars.data },
  );
  if (error || !restaurantId) {
    return { formError: "We couldn't submit this rating." };
  }

  revalidatePath("/customer");
  revalidatePath("/restaurant/visits");
  revalidatePath("/restaurants");
  revalidatePath(`/restaurants/${restaurantId}`);
  return { success: "Rating submitted." };
}

export async function submitCustomerRating(
  _previousState: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  const visitId = visitIdSchema.safeParse(formValue(formData, "visitId"));
  const stars = starsSchema.safeParse(formValue(formData, "stars"));
  if (!visitId.success) return { formError: "This visit is invalid." };
  if (!stars.success) return { fieldError: "Choose a rating from 1 to 5." };

  const { supabase } = await requireRestaurantStaff();
  const { data: customerId, error } = await supabase.rpc(
    "submit_customer_rating",
    { target_visit_id: visitId.data, rating_stars: stars.data },
  );
  if (error || !customerId) {
    return { formError: "We couldn't submit this customer rating." };
  }

  revalidatePath("/restaurant/visits");
  revalidatePath("/customer");
  return { success: "Customer rating submitted." };
}
