"use client";

import { useActionState } from "react";

import { updateCustomerProfile, updateStaffProfile } from "./actions";
import type { ProfileActionState } from "./validation";

const initialState: ProfileActionState = {};

function Feedback({ state }: Readonly<{ state: ProfileActionState }>) {
  return (
    <>
      {state.formError ? (
        <p role="alert" className="text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-green-700">
          {state.success}
        </p>
      ) : null}
    </>
  );
}

export function PersonalProfileForm({
  accountType,
  email,
  firstName,
  lastName,
}: Readonly<{
  accountType: "customer" | "staff";
  email: string;
  firstName: string;
  lastName: string;
}>) {
  const action =
    accountType === "customer" ? updateCustomerProfile : updateStaffProfile;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-stone-800"
          >
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            defaultValue={firstName}
            autoComplete="given-name"
            required
            aria-invalid={Boolean(state.fieldErrors?.firstName)}
            className="ui-field mt-2"
          />
          {state.fieldErrors?.firstName?.[0] ? (
            <p className="mt-2 text-sm text-red-700">
              {state.fieldErrors.firstName[0]}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-stone-800"
          >
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            defaultValue={lastName}
            autoComplete="family-name"
            required
            aria-invalid={Boolean(state.fieldErrors?.lastName)}
            className="ui-field mt-2"
          />
          {state.fieldErrors?.lastName?.[0] ? (
            <p className="mt-2 text-sm text-red-700">
              {state.fieldErrors.lastName[0]}
            </p>
          ) : null}
        </div>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-stone-800"
        >
          Email
        </label>
        <input
          id="email"
          value={email}
          readOnly
          className="ui-field mt-2 bg-[var(--surface-subtle)] text-[var(--ink-muted)]"
        />
        <p className="mt-2 text-sm text-stone-500">
          Email changes are not available yet.
        </p>
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="ui-button-primary disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save personal profile"}
      </button>
    </form>
  );
}
