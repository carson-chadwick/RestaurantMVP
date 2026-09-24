import { z } from "zod";

import { weekDays } from "./profile";

const optionalText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `${label} must be ${maximum} characters or fewer.`)
    .transform((value) => value || null);

const timeSchema = z
  .string()
  .regex(/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/, "Enter a valid time.");

const dayHoursSchema = z
  .union([
    z.strictObject({ closed: z.literal(true) }),
    z.strictObject({ open: timeSchema, close: timeSchema }),
  ])
  .superRefine((hours, context) => {
    if ("closed" in hours || hours.close > hours.open) return;
    context.addIssue({
      code: "custom",
      message: "Closing time must be later than opening time.",
      path: ["close"],
    });
  });

export const weeklyHoursSchema = z.strictObject(
  Object.fromEntries(weekDays.map((day) => [day, dayHoursSchema])) as Record<
    (typeof weekDays)[number],
    typeof dayHoursSchema
  >,
);

export const restaurantProfileSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(100, "Restaurant name must be 100 characters or fewer."),
  address: optionalText("Address", 300),
  phone: optionalText("Phone", 25).superRefine((phone, context) => {
    if (phone === null) return;
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 7 && /^[+\d().\-\s]+$/.test(phone)) return;
    context.addIssue({
      code: "custom",
      message: "Enter a valid phone number.",
    });
  }),
  description: optionalText("Description", 500),
  weeklyHours: weeklyHoursSchema.nullable(),
});

export type RestaurantProfileInput = z.input<typeof restaurantProfileSchema>;
export type RestaurantProfileValues = z.output<typeof restaurantProfileSchema>;

export type RestaurantProfileActionState = {
  fieldErrors?: Partial<
    Record<"restaurantName" | "address" | "phone" | "description", string[]>
  >;
  hoursError?: string;
  formError?: string;
  success?: string;
};
