"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { getAccountDestination } from "./role";
import type { AuthActionState } from "./validation";
import {
  employeeSignupSchema,
  loginSchema,
  restaurantSignupSchema,
  signupSchema,
} from "./validation";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signup(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = signupSchema.safeParse({
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    confirmPassword: formValue(formData, "confirmPassword"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        account_type: "customer",
        first_name: result.data.firstName,
        last_name: result.data.lastName,
      },
    },
  });

  if (error) {
    return {
      formError:
        "We couldn't create your account. Check your information or try signing in.",
    };
  }

  redirect("/customer");
}

export async function restaurantSignup(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = restaurantSignupSchema.safeParse({
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
    restaurantName: formValue(formData, "restaurantName"),
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    confirmPassword: formValue(formData, "confirmPassword"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        account_type: "restaurant_owner",
        first_name: result.data.firstName,
        last_name: result.data.lastName,
        restaurant_name: result.data.restaurantName,
      },
    },
  });

  if (error) {
    return {
      formError:
        "We couldn't create your restaurant account. Check your information or try signing in.",
    };
  }

  redirect("/restaurant");
}

export async function employeeSignup(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = employeeSignupSchema.safeParse({
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    confirmPassword: formValue(formData, "confirmPassword"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        account_type: "restaurant_employee",
        first_name: result.data.firstName,
        last_name: result.data.lastName,
      },
    },
  });

  if (error) {
    return {
      formError:
        "We couldn't create your employee account. Check your information or try signing in.",
    };
  }

  redirect("/restaurant");
}

export async function login(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = loginSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
  });

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { formError: "Email or password is incorrect." };
  }

  const destination = await getAccountDestination(supabase, data.user.id);

  if (!destination) {
    await supabase.auth.signOut();
    return {
      formError:
        "We couldn't determine access for this account. Please contact support.",
    };
  }

  redirect(destination);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
