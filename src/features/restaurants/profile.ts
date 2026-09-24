export const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekDay = (typeof weekDays)[number];

export type DayHours = { closed: true } | { open: string; close: string };

export type WeeklyHours = Record<WeekDay, DayHours>;

export type RatingSummary = {
  averageRating: number | null;
  ratingCount: number;
};

export type RestaurantProfile = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  description: string | null;
  weeklyHours: WeeklyHours | null;
  ratingSummary: RatingSummary;
};

export const emptyRatingSummary: RatingSummary = {
  averageRating: null,
  ratingCount: 0,
};

export function formatDay(day: WeekDay) {
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}`;
}
