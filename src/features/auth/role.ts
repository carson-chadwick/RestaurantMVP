import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type AccountRole = Database["public"]["Enums"]["account_role"];

export function destinationForAccountRole(role: AccountRole) {
  return role === "customer" ? "/customer" : "/restaurant";
}

export async function getAccountDestination(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("account_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return destinationForAccountRole(data.role);
}
