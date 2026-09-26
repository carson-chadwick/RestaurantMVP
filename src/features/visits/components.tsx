"use client";

import { useActionState } from "react";

import {
  recordPaidVisit,
  submitCustomerRating,
  submitRestaurantRating,
} from "./actions";
import type {
  CustomerDirectoryRow,
  CustomerRatingSummary,
  CustomerVisit,
  EligibleCustomerRatingVisit,
  VisitActionState,
} from "./types";

const initialState: VisitActionState = {};

export function CustomerRatingSummaryDisplay({
  averageRating,
  ratingCount,
}: Readonly<CustomerRatingSummary>) {
  const filledStars = averageRating === null ? 0 : Math.round(averageRating);
  const label =
    averageRating === null
      ? "No customer reputation ratings yet"
      : `Customer rating ${averageRating.toFixed(1)} out of 5`;

  return (
    <div aria-label={label}>
      <div className="flex gap-0.5 text-lg" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={
              index < filledStars
                ? "text-[var(--cognac-bright)]"
                : "text-[#d7d0c5]"
            }
          >
            {index < filledStars ? "★" : "☆"}
          </span>
        ))}
      </div>
      <p className="text-sm font-semibold text-stone-800">
        {averageRating === null
          ? "No ratings yet"
          : `${averageRating.toFixed(1)} average`}
      </p>
      <p className="text-sm text-stone-500">
        {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
      </p>
    </div>
  );
}

export function RecordVisitControl({
  customer,
}: Readonly<{ customer: CustomerDirectoryRow }>) {
  const [state, action, pending] = useActionState(
    recordPaidVisit,
    initialState,
  );
  return (
    <details className="mt-4">
      <summary className="cursor-pointer font-semibold text-[var(--cognac)]">
        Select customer
      </summary>
      <form
        action={action}
        className="mt-3 rounded-xl bg-[var(--surface-subtle)] p-4"
      >
        <input type="hidden" name="customerId" value={customer.userId} />
        <p className="text-sm text-stone-700">
          Record a paid visit for {customer.firstName} {customer.lastName} (
          {customer.email})? This represents payment made outside Dining Plus.
        </p>
        {state.formError ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {state.formError}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="mt-2 text-sm text-green-700">
            {state.success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || Boolean(state.success)}
          className="ui-button-primary mt-3 disabled:opacity-60"
        >
          {pending ? "Recording…" : "Confirm visit"}
        </button>
      </form>
    </details>
  );
}

export function RestaurantRatingForm({
  visit,
}: Readonly<{ visit: CustomerVisit }>) {
  const [state, action, pending] = useActionState(
    submitRestaurantRating,
    initialState,
  );
  return (
    <details className="mt-4">
      <summary className="cursor-pointer font-semibold text-[var(--cognac)]">
        Rate this visit
      </summary>
      <form
        action={action}
        className="mt-3 rounded-xl bg-[var(--surface-subtle)] p-4"
      >
        <input type="hidden" name="visitId" value={visit.visitId} />
        <fieldset>
          <legend className="text-sm font-medium text-stone-800">
            Choose 1 to 5 stars
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((stars) => (
              <label
                key={stars}
                className="flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border border-[#d8d1c5] bg-white px-3 py-2 has-checked:border-[var(--cognac)] has-checked:bg-[var(--cognac-soft)]"
              >
                <input type="radio" name="stars" value={stars} required />
                <span>
                  {stars} {stars === 1 ? "star" : "stars"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="mt-3 text-sm text-stone-600">
          Your rating is final and cannot be edited or deleted.
        </p>
        {state.fieldError ? (
          <p className="mt-2 text-sm text-red-700">{state.fieldError}</p>
        ) : null}
        {state.formError ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {state.formError}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="mt-2 text-sm text-green-700">
            {state.success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || Boolean(state.success)}
          className="ui-button-primary mt-3 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Confirm rating"}
        </button>
      </form>
    </details>
  );
}

export function CustomerRatingForm({
  visit,
}: Readonly<{ visit: EligibleCustomerRatingVisit }>) {
  const [state, action, pending] = useActionState(
    submitCustomerRating,
    initialState,
  );
  return (
    <details className="mt-4">
      <summary className="cursor-pointer font-semibold text-[var(--cognac)]">
        Rate this customer
      </summary>
      <form
        action={action}
        className="mt-3 rounded-xl bg-[var(--surface-subtle)] p-4"
      >
        <input type="hidden" name="visitId" value={visit.visitId} />
        <fieldset>
          <legend className="text-sm font-medium text-stone-800">
            Choose 1 to 5 stars for {visit.firstName} {visit.lastName}
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((stars) => (
              <label
                key={stars}
                className="flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border border-[#d8d1c5] bg-white px-3 py-2 has-checked:border-[var(--cognac)] has-checked:bg-[var(--cognac-soft)]"
              >
                <input type="radio" name="stars" value={stars} required />
                <span>
                  {stars} {stars === 1 ? "star" : "stars"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="mt-3 text-sm text-stone-600">
          This rating is final. The customer can see the restaurant, visit date,
          and rating, but not which staff member submitted it.
        </p>
        {state.fieldError ? (
          <p className="mt-2 text-sm text-red-700">{state.fieldError}</p>
        ) : null}
        {state.formError ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {state.formError}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="mt-2 text-sm text-green-700">
            {state.success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || Boolean(state.success)}
          className="ui-button-primary mt-3 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Confirm customer rating"}
        </button>
      </form>
    </details>
  );
}
