"use server";

import { revalidatePath } from "next/cache";

import { requireRestaurantOwner } from "@/features/auth/guards";

import { weekDays, type WeeklyHours } from "./profile";
import {
  restaurantProfileSchema,
  type RestaurantProfileActionState,
} from "./profile-validation";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function weeklyHoursFrom(formData: FormData): WeeklyHours | null {
  const hours = Object.fromEntries(
    weekDays.map((day) => {
      const open = formValue(formData, `${day}Open`);
      const close = formValue(formData, `${day}Close`);
      if (
        formData.get(`${day}Closed`) === "on" ||
        (open === "" && close === "")
      ) {
        return [day, { closed: true }];
      }
      return [
        day,
        {
          open,
          close,
        },
      ];
    }),
  ) as WeeklyHours;

  return weekDays.every((day) => "closed" in hours[day]) ? null : hours;
}

export async function updateRestaurantProfile(
  _previousState: RestaurantProfileActionState,
  formData: FormData,
): Promise<RestaurantProfileActionState> {
  const result = restaurantProfileSchema.safeParse({
    restaurantName: formValue(formData, "restaurantName"),
    address: formValue(formData, "address"),
    phone: formValue(formData, "phone"),
    description: formValue(formData, "description"),
    weeklyHours: weeklyHoursFrom(formData),
  });

  if (!result.success) {
    const flattened = result.error.flatten();
    return {
      fieldErrors: flattened.fieldErrors,
      hoursError: flattened.fieldErrors.weeklyHours?.[0],
    };
  }

  const { supabase, user } = await requireRestaurantOwner();
  const { error } = await supabase
    .from("restaurants")
    .update({
      name: result.data.restaurantName,
      address: result.data.address,
      phone: result.data.phone,
      description: result.data.description,
      weekly_hours: result.data.weeklyHours,
    })
    .eq("owner_user_id", user.id);

  if (error) return { formError: "We couldn't update your restaurant." };

  revalidatePath("/restaurant");
  revalidatePath("/restaurant/profile");
  return { success: "Restaurant updated." };
}
