"use client";

import Link from "next/link";
import { useActionState } from "react";

import { employeeSignup, restaurantSignup } from "./actions";
import { Field, SubmitButton } from "./form-controls";
import type { AuthActionState } from "./validation";

const initialState: AuthActionState = {};

export function StaffSignupForm({
  accountType,
}: Readonly<{ accountType: "owner" | "employee" }>) {
  const action = accountType === "owner" ? restaurantSignup : employeeSignup;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isOwner = accountType === "owner";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.formError ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
        >
          {state.formError}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="First name"
          name="firstName"
          autoComplete="given-name"
          error={state.fieldErrors?.firstName?.[0]}
        />
        <Field
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          error={state.fieldErrors?.lastName?.[0]}
        />
      </div>
      {isOwner ? (
        <Field
          label="Restaurant name"
          name="restaurantName"
          autoComplete="organization"
          error={state.fieldErrors?.restaurantName?.[0]}
        />
      ) : null}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.password?.[0]}
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword?.[0]}
      />
      <SubmitButton
        idleLabel={
          isOwner ? "Create restaurant account" : "Create employee account"
        }
        pending={pending}
        pendingLabel="Creating account…"
      />
      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-700 hover:text-amber-800"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
