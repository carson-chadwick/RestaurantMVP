"use client";

import { useActionState } from "react";

import { updateRestaurantProfile } from "./profile-actions";
import {
  emptyRatingSummary,
  formatDay,
  weekDays,
  type RestaurantProfile,
} from "./profile";
import type { RestaurantProfileActionState } from "./profile-validation";

const initialState: RestaurantProfileActionState = {};

export function RatingSummaryDisplay({
  averageRating,
  ratingCount,
}: Readonly<RestaurantProfile["ratingSummary"]>) {
  const filledStars = averageRating === null ? 0 : Math.round(averageRating);
  const ratingLabel =
    averageRating === null
      ? "No customer ratings yet"
      : `Rated ${averageRating.toFixed(1)} out of 5`;

  return (
    <div aria-label={ratingLabel}>
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
      {averageRating === null ? (
        <p className="mt-1 font-semibold text-stone-900">No ratings yet</p>
      ) : null}
      <p className="text-sm text-stone-500">
        {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
      </p>
    </div>
  );
}

export function RestaurantDetails({
  profile,
}: Readonly<{ profile: RestaurantProfile }>) {
  return (
    <div className="space-y-5">
      <RatingSummaryDisplay {...profile.ratingSummary} />
      {profile.address ? <p>{profile.address}</p> : null}
      {profile.phone ? (
        <p>
          <a
            className="font-semibold text-[var(--cognac)] hover:underline"
            href={`tel:${profile.phone}`}
          >
            {profile.phone}
          </a>
        </p>
      ) : null}
      {profile.description ? (
        <p className="leading-7 text-stone-600">{profile.description}</p>
      ) : null}
      {profile.weeklyHours ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
          {weekDays.map((day) => {
            const hours = profile.weeklyHours?.[day];
            return (
              <div key={day} className="contents">
                <dt className="font-medium text-stone-800">{formatDay(day)}</dt>
                <dd className="text-stone-600">
                  {!hours || "closed" in hours
                    ? "Closed"
                    : `${hours.open}–${hours.close}`}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}
    </div>
  );
}

export function RestaurantProfileForm({
  profile,
}: Readonly<{ profile: RestaurantProfile }>) {
  const [state, formAction, pending] = useActionState(
    updateRestaurantProfile,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div>
        <label
          htmlFor="restaurantName"
          className="block text-sm font-medium text-stone-800"
        >
          Restaurant name
        </label>
        <input
          id="restaurantName"
          name="restaurantName"
          defaultValue={profile.name}
          required
          aria-invalid={Boolean(state.fieldErrors?.restaurantName)}
          className="ui-field mt-2"
        />
        {state.fieldErrors?.restaurantName?.[0] ? (
          <p className="mt-2 text-sm text-red-700">
            {state.fieldErrors.restaurantName[0]}
          </p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-stone-800"
        >
          Address
        </label>
        <textarea
          id="address"
          name="address"
          defaultValue={profile.address ?? ""}
          maxLength={300}
          rows={2}
          aria-invalid={Boolean(state.fieldErrors?.address)}
          className="ui-field mt-2"
        />
        {state.fieldErrors?.address?.[0] ? (
          <p className="mt-2 text-sm text-red-700">
            {state.fieldErrors.address[0]}
          </p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-stone-800"
        >
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          maxLength={25}
          autoComplete="tel"
          aria-invalid={Boolean(state.fieldErrors?.phone)}
          className="ui-field mt-2"
        />
        {state.fieldErrors?.phone?.[0] ? (
          <p className="mt-2 text-sm text-red-700">
            {state.fieldErrors.phone[0]}
          </p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-stone-800"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={profile.description ?? ""}
          maxLength={500}
          rows={4}
          aria-invalid={Boolean(state.fieldErrors?.description)}
          className="ui-field mt-2"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="mt-2 text-sm text-red-700">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>
      <fieldset>
        <legend className="text-base font-semibold text-stone-900">
          Weekly hours
        </legend>
        <p className="mt-1 text-sm text-stone-500">
          Times are local. Split and overnight hours are not supported.
        </p>
        <div className="mt-4 space-y-4">
          {weekDays.map((day) => {
            const hours = profile.weeklyHours?.[day] ?? {
              closed: true as const,
            };
            const closed = "closed" in hours;
            return (
              <div
                key={day}
                className="grid items-end gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)]/55 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <p className="self-center font-medium text-stone-800">
                  {formatDay(day)}
                </p>
                <label className="text-sm text-stone-700">
                  Open
                  <input
                    aria-label={`${formatDay(day)} open`}
                    name={`${day}Open`}
                    type="time"
                    defaultValue={closed ? "" : hours.open}
                    className="ui-field mt-1 min-h-10 py-2"
                  />
                </label>
                <label className="text-sm text-stone-700">
                  Close
                  <input
                    aria-label={`${formatDay(day)} close`}
                    name={`${day}Close`}
                    type="time"
                    defaultValue={closed ? "" : hours.close}
                    className="ui-field mt-1 min-h-10 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 pb-2 text-sm text-stone-700">
                  <input
                    name={`${day}Closed`}
                    type="checkbox"
                    defaultChecked={closed}
                  />
                  Closed
                </label>
              </div>
            );
          })}
        </div>
        {state.hoursError ? (
          <p className="mt-2 text-sm text-red-700">{state.hoursError}</p>
        ) : null}
      </fieldset>
      <RatingSummaryDisplay {...emptyRatingSummary} />
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
      <button
        type="submit"
        disabled={pending}
        className="ui-button-primary disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save restaurant"}
      </button>
    </form>
  );
}
