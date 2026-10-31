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

function retainedSignupValues(formData: FormData) {
  return {
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
    restaurantName: formValue(formData, "restaurantName"),
    email: formValue(formData, "email"),
    privacyAcknowledged: formData.get("privacyAcknowledged") === "on",
  };
}

function signupValidationError(
  formData: FormData,
  fieldErrors: NonNullable<AuthActionState["fieldErrors"]>,
): AuthActionState {
  const clearFields: NonNullable<AuthActionState["clearFields"]> = [];
  if (fieldErrors.password) clearFields.push("password");
  if (fieldErrors.confirmPassword) clearFields.push("confirmPassword");
  return {
    fieldErrors,
    values: retainedSignupValues(formData),
    clearFields,
  };
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
    privacyAcknowledged: formData.get("privacyAcknowledged") === "on",
  });

  if (!result.success) {
    return signupValidationError(formData, result.error.flatten().fieldErrors);
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
        identity_disclosure_acknowledged: true,
      },
    },
  });

  if (error) {
    return {
      formError:
        "We couldn't create your account. No account was created by this attempt, so you can correct your information and retry with the same email, or sign in if you already have an account.",
      values: retainedSignupValues(formData),
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
    return signupValidationError(formData, result.error.flatten().fieldErrors);
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
        "We couldn't create your restaurant account. No account was created by this attempt, so you can correct your information and retry with the same email, or sign in if you already have an account.",
      values: retainedSignupValues(formData),
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
    return signupValidationError(formData, result.error.flatten().fieldErrors);
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
        "We couldn't create your employee account. No account was created by this attempt, so you can correct your information and retry with the same email, or sign in if you already have an account.",
      values: retainedSignupValues(formData),
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
