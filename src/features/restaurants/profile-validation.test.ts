import { describe, expect, it } from "vitest";

import { weekDays, type WeeklyHours } from "./profile";
import {
  restaurantProfileSchema,
  weeklyHoursSchema,
} from "./profile-validation";

const closedWeek = Object.fromEntries(
  weekDays.map((day) => [day, { closed: true }]),
) as WeeklyHours;

describe("restaurant profile validation", () => {
  it("normalizes optional blank fields to null", () => {
    expect(
      restaurantProfileSchema.parse({
        restaurantName: "  The Test Table  ",
        address: " ",
        phone: "",
        description: "",
        weeklyHours: null,
      }),
    ).toEqual({
      restaurantName: "The Test Table",
      address: null,
      phone: null,
      description: null,
      weeklyHours: null,
    });
  });

  it("accepts a complete seven-day week with closed and open days", () => {
    const hours = { ...closedWeek, monday: { open: "09:00", close: "17:00" } };
    expect(weeklyHoursSchema.parse(hours)).toEqual(hours);
  });

  it("rejects missing days, invalid times, and overnight intervals", () => {
    const missingDay = Object.fromEntries(
      Object.entries(closedWeek).filter(([day]) => day !== "sunday"),
    );
    expect(weeklyHoursSchema.safeParse(missingDay).success).toBe(false);
    expect(
      weeklyHoursSchema.safeParse({
        ...closedWeek,
        monday: { open: "9:00", close: "17:00" },
      }).success,
    ).toBe(false);
    expect(
      weeklyHoursSchema.safeParse({
        ...closedWeek,
        monday: { open: "17:00", close: "09:00" },
      }).success,
    ).toBe(false);
  });

  it("validates names, field limits, and phone numbers", () => {
    const base = {
      restaurantName: "x",
      address: "a".repeat(301),
      phone: "not-a-phone",
      description: "d".repeat(501),
      weeklyHours: null,
    };
    const result = restaurantProfileSchema.safeParse(base);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        restaurantName: expect.any(Array),
        address: expect.any(Array),
        phone: expect.any(Array),
        description: expect.any(Array),
      });
    }
  });
});
