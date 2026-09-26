"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signup } from "./actions";
import { Field, SubmitButton } from "./form-controls";
import type { AuthActionState } from "./validation";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.formError ? (
        <p role="alert" className="ui-status-error text-sm">
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
      <div>
        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink-soft)]">
          <input
            name="privacyAcknowledged"
            type="checkbox"
            required
            aria-invalid={Boolean(state.fieldErrors?.privacyAcknowledged)}
            className="mt-1 h-5 w-5 accent-[var(--cognac)]"
          />
          <span>
            I acknowledge that authorized restaurant staff may use my name and
            email to identify me and record visits, and may rate me after I rate
            their restaurant for an eligible visit.
          </span>
        </label>
        {state.fieldErrors?.privacyAcknowledged?.[0] ? (
          <p className="mt-2 text-sm text-red-700">
            {state.fieldErrors.privacyAcknowledged[0]}
          </p>
        ) : null}
      </div>
      <SubmitButton
        idleLabel="Create account"
        pending={pending}
        pendingLabel="Creating account…"
      />
      <p className="text-center text-xs text-stone-500">
        Read our{" "}
        <Link
          href="/privacy"
          className="font-semibold text-[var(--cognac)] hover:underline"
        >
          privacy policy
        </Link>
        .
      </p>
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
