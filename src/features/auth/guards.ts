import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  destinationForAccountRole,
  getAccountDestination,
  type AccountRole,
} from "./role";

export async function redirectAuthenticatedAccount() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) return;

  const destination = await getAccountDestination(supabase, data.user.id);
  if (destination) redirect(destination);

  await supabase.auth.signOut();
}

export async function requireAccountRole(allowedRoles: readonly AccountRole[]) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/login");
  }

  const { data: roleData, error: roleError } = await supabase
    .from("account_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();

  if (roleError || !roleData) {
    await supabase.auth.signOut();
    redirect("/login?error=access");
  }

  if (!allowedRoles.includes(roleData.role)) {
    redirect(destinationForAccountRole(roleData.role));
  }

  return {
    role: roleData.role,
    supabase,
    user: userData.user,
  };
}

export async function requireCustomer() {
  return requireAccountRole(["customer"]);
}

export async function requireRestaurantStaff() {
  return requireAccountRole(["restaurant_owner", "restaurant_employee"]);
}

export async function requireRestaurantOwner() {
  return requireAccountRole(["restaurant_owner"]);
}
