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
        <p role="alert" className="ui-status-error text-sm">
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
        New to Dining+?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--cognac)] hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
