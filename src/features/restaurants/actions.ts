"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type { EmployeeActionState } from "./validation";
import { employeeEmailSchema, employeeIdSchema } from "./validation";

export async function grantEmployeeAccess(
  _previousState: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const emailValue = formData.get("employeeEmail");
  const result = employeeEmailSchema.safeParse(
    typeof emailValue === "string" ? emailValue : "",
  );

  if (!result.success) {
    return { fieldError: result.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("grant_restaurant_employee_access", {
    employee_email: result.data,
  });

  if (error) {
    return {
      formError:
        "No available employee account matches that email. Ask the employee to create an account or confirm the address.",
    };
  }

  revalidatePath("/restaurant");
  return { success: "Employee access granted." };
}

export async function revokeEmployeeAccess(formData: FormData) {
  const value = formData.get("employeeUserId");
  const result = employeeIdSchema.safeParse(
    typeof value === "string" ? value : "",
  );

  if (!result.success) return;

  const supabase = await createClient();
  await supabase.rpc("revoke_restaurant_employee_access", {
    target_employee_id: result.data,
  });
  revalidatePath("/restaurant");
}
