"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      if (state.clearFields?.includes("password")) setPassword("");
      if (state.clearFields?.includes("confirmPassword")) {
        setConfirmPassword("");
      }
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    });
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {state.formError ? (
        <p role="alert" className="ui-status-error text-sm">
          {state.formError}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          key={`firstName-${state.values?.firstName ?? ""}`}
          label="First name"
          name="firstName"
          autoComplete="given-name"
          error={state.fieldErrors?.firstName?.[0]}
          defaultValue={state.values?.firstName}
        />
        <Field
          key={`lastName-${state.values?.lastName ?? ""}`}
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          error={state.fieldErrors?.lastName?.[0]}
          defaultValue={state.values?.lastName}
        />
      </div>
      {isOwner ? (
        <Field
          key={`restaurantName-${state.values?.restaurantName ?? ""}`}
          label="Restaurant name"
          name="restaurantName"
          autoComplete="organization"
          error={state.fieldErrors?.restaurantName?.[0]}
          defaultValue={state.values?.restaurantName}
        />
      ) : null}
      <Field
        key={`email-${state.values?.email ?? ""}`}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
        defaultValue={state.values?.email}
        helpText="Your email is your sign-in ID. You do not need a separate username."
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.password?.[0]}
        helpText="Use at least 6 characters."
        inputRef={passwordRef}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword?.[0]}
        inputRef={confirmPasswordRef}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      <SubmitButton
        idleLabel={
          isOwner ? "Create restaurant account" : "Create employee account"
        }
        pending={pending}
        pendingLabel="Creating account…"
      />
      <p className="text-center text-sm text-stone-600">
        <Link
          href="/signup"
          className="font-semibold text-[var(--cognac)] hover:underline"
        >
          Choose another account type
        </Link>
      </p>
      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--cognac)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
