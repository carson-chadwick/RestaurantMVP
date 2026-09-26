import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { RestaurantProfile, WeeklyHours } from "./profile";

export const RESTAURANTS_PER_PAGE = 12;

const restaurantIdSchema = z.uuid();

type PublicRestaurantRow = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  description: string | null;
  weekly_hours: unknown;
  average_rating: number | null;
  rating_count: number;
};

export type RestaurantDirectoryResult = {
  restaurants: RestaurantProfile[];
  totalCount: number;
};

function toRestaurantProfile(row: PublicRestaurantRow): RestaurantProfile {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    description: row.description,
    weeklyHours: row.weekly_hours as WeeklyHours | null,
    ratingSummary: {
      averageRating: row.average_rating,
      ratingCount: row.rating_count,
    },
  };
}

export function normalizeRestaurantSearch(
  value: string | string[] | undefined,
) {
  const text = Array.isArray(value) ? value[0] : value;
  return (text ?? "").trim().slice(0, 100);
}

export function normalizeRestaurantPage(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value[0] : value;
  if (!text || !/^\d+$/.test(text)) return 1;
  const page = Number(text);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function isRestaurantId(value: string) {
  return restaurantIdSchema.safeParse(value).success;
}

export async function listPublicRestaurants(
  search: string,
  page: number,
): Promise<RestaurantDirectoryResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_public_restaurants", {
    search_text: search || undefined,
    result_limit: RESTAURANTS_PER_PAGE,
    result_offset: (page - 1) * RESTAURANTS_PER_PAGE,
  });

  if (error) throw new Error("restaurant_directory_unavailable");

  const rows = data ?? [];
  return {
    restaurants: rows.map(toRestaurantProfile),
    totalCount: rows[0]?.total_count ?? 0,
  };
}

export async function getPublicRestaurant(
  restaurantId: string,
): Promise<RestaurantProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_restaurant", {
    target_restaurant_id: restaurantId,
  });

  if (error) throw new Error("restaurant_profile_unavailable");
  return data?.[0] ? toRestaurantProfile(data[0]) : null;
}
