"use client";

import { useActionState, useState } from "react";

import {
  deleteRestaurantReview,
  recordPaidVisit,
  submitCustomerRating,
  submitRestaurantRating,
  updateRestaurantReview,
} from "./actions";
import type {
  CustomerDirectoryRow,
  CustomerRatingSummary,
  CustomerVisit,
  EligibleCustomerRatingVisit,
  VisitActionState,
} from "./types";

const initialState: VisitActionState = {};

function StarRatingInput({
  defaultValue,
  legend,
}: Readonly<{ defaultValue?: number | null; legend: string }>) {
  const [selected, setSelected] = useState(defaultValue ?? 0);
  const [preview, setPreview] = useState(0);
  const visibleValue = preview || selected;

  return (
    <fieldset>
      <legend className="text-sm font-medium text-stone-800">{legend}</legend>
      <div className="mt-2 flex w-fit gap-1" onMouseLeave={() => setPreview(0)}>
        {[1, 2, 3, 4, 5].map((stars) => (
          <label
            key={stars}
            className="group relative cursor-pointer rounded-md p-1"
            onMouseEnter={() => setPreview(stars)}
          >
            <input
              className="peer sr-only"
              type="radio"
              name="stars"
              value={stars}
              defaultChecked={defaultValue === stars}
              onChange={() => setSelected(stars)}
              required
            />
            <span
              aria-hidden="true"
              className={`block text-4xl leading-none transition peer-focus-visible:rounded-sm peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--cognac-bright)] ${
                stars <= visibleValue
                  ? "text-[var(--cognac-bright)]"
                  : "text-[#d7d0c5] group-hover:text-[var(--cognac-bright)]"
              }`}
            >
              ★
            </span>
            <span className="sr-only">
              {stars} {stars === 1 ? "star" : "stars"}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ReviewCelebration() {
  const colors = ["#d17842", "#f0b45f", "#fff", "#a94f24"];

  return (
    <>
      <div className="review-confetti" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span
            key={index}
            className="review-confetti-piece"
            style={{
              left: `${4 + ((index * 17) % 92)}%`,
              animationDelay: `${(index % 8) * 45}ms`,
              backgroundColor: colors[index % colors.length],
            }}
          />
        ))}
      </div>
      <p role="status" className="ui-status-success mt-4 font-semibold">
        Rating submitted — you earned 10 points!
      </p>
    </>
  );
}

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
        <StarRatingInput legend="Choose 1 to 5 stars" />
        <div className="mt-4">
          <label
            htmlFor={`reviewText-${visit.visitId}`}
            className="text-sm font-medium text-stone-800"
          >
            Written review <span className="text-stone-500">(optional)</span>
          </label>
          <textarea
            id={`reviewText-${visit.visitId}`}
            name="reviewText"
            maxLength={1000}
            rows={4}
            aria-describedby={`reviewText-help-${visit.visitId}`}
            className="ui-field mt-2"
            placeholder="What should other diners know?"
          />
          <p
            id={`reviewText-help-${visit.visitId}`}
            className="mt-2 text-sm text-stone-500"
          >
            Your text will be public, but your identity will not be shown.
          </p>
        </div>
        <p className="mt-3 text-sm text-stone-600">
          You can edit or delete this review later from Activity.
        </p>
        {state.fieldError ? (
          <p className="mt-2 text-sm text-red-700">{state.fieldError}</p>
        ) : null}
        {state.reviewTextError ? (
          <p className="mt-2 text-sm text-red-700">{state.reviewTextError}</p>
        ) : null}
        {state.formError ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {state.formError}
          </p>
        ) : null}
        {state.success ? <ReviewCelebration /> : null}
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

export function CustomerReviewEditor({
  visit,
}: Readonly<{ visit: CustomerVisit }>) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateRestaurantReview,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteRestaurantReview,
    initialState,
  );

  return (
    <details className="mt-4">
      <summary className="cursor-pointer font-semibold text-[var(--cognac)]">
        Edit review
      </summary>
      <div className="mt-3 rounded-xl bg-[var(--surface-subtle)] p-4">
        <form action={updateAction}>
          <input type="hidden" name="visitId" value={visit.visitId} />
          <StarRatingInput defaultValue={visit.stars} legend="Rating" />
          <label
            htmlFor={`editReviewText-${visit.visitId}`}
            className="mt-4 block text-sm font-medium text-stone-800"
          >
            Written review <span className="text-stone-500">(optional)</span>
          </label>
          <textarea
            id={`editReviewText-${visit.visitId}`}
            name="reviewText"
            defaultValue={visit.reviewText ?? ""}
            maxLength={1000}
            rows={4}
            className="ui-field mt-2"
          />
          {updateState.fieldError || updateState.reviewTextError ? (
            <p className="mt-2 text-sm text-red-700">
              {updateState.fieldError ?? updateState.reviewTextError}
            </p>
          ) : null}
          {updateState.formError ? (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {updateState.formError}
            </p>
          ) : null}
          {updateState.success ? (
            <p role="status" className="mt-2 text-sm text-green-700">
              {updateState.success}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={updatePending}
            className="ui-button-primary mt-3 disabled:opacity-60"
          >
            {updatePending ? "Saving…" : "Save review"}
          </button>
        </form>
        <form
          action={deleteAction}
          className="mt-4 border-t border-[var(--line)] pt-4"
        >
          <input type="hidden" name="visitId" value={visit.visitId} />
          <p className="text-sm text-stone-600">
            Deleting removes this review from the restaurant and recalculates
            your points and badges.
          </p>
          {deleteState.formError ? (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {deleteState.formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={deletePending}
            className="ui-button-secondary mt-3 disabled:opacity-60"
          >
            {deletePending ? "Deleting…" : "Delete review"}
          </button>
        </form>
      </div>
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
        <StarRatingInput
          legend={`Choose 1 to 5 stars for ${visit.firstName} ${visit.lastName}`}
        />
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
