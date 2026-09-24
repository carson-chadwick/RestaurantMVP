"use server";

import { revalidatePath } from "next/cache";

import {
  requireCustomer,
  requireRestaurantStaff,
} from "@/features/auth/guards";

import type { ProfileActionState } from "./validation";
import { personalProfileSchema } from "./validation";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateCustomerProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const result = personalProfileSchema.safeParse({
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const { supabase, user } = await requireCustomer();
  const { error } = await supabase
    .from("customer_profiles")
    .update({
      first_name: result.data.firstName,
      last_name: result.data.lastName,
    })
    .eq("user_id", user.id);

  if (error) return { formError: "We couldn't update your profile." };

  revalidatePath("/customer");
  revalidatePath("/customer/profile");
  return { success: "Profile updated." };
}

export async function updateStaffProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const result = personalProfileSchema.safeParse({
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const { supabase, user } = await requireRestaurantStaff();
  const { error } = await supabase
    .from("staff_profiles")
    .update({
      first_name: result.data.firstName,
      last_name: result.data.lastName,
    })
    .eq("user_id", user.id);

  if (error) return { formError: "We couldn't update your profile." };

  revalidatePath("/restaurant");
  revalidatePath("/restaurant/profile");
  return { success: "Profile updated." };
}
