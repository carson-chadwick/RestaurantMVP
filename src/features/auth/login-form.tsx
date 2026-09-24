"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login } from "./actions";
import { Field, SubmitButton } from "./form-controls";
import type { AuthActionState } from "./validation";

const initialState: AuthActionState = {};

export function LoginForm({
  initialError,
}: Readonly<{ initialError?: string }>) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const formError = state.formError ?? initialError;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {formError ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
        >
          {formError}
        </p>
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
        autoComplete="current-password"
        error={state.fieldErrors?.password?.[0]}
      />
      <SubmitButton
        idleLabel="Sign in"
        pending={pending}
        pendingLabel="Signing in…"
      />
      <p className="text-center text-sm text-stone-600">
        New to Dining Plus?{" "}
        <Link
          href="/signup"
          className="font-semibold text-amber-700 hover:text-amber-800"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
