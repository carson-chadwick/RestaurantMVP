export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: Readonly<{
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete: string;
  error?: string;
}>) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-stone-800"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 transition outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 aria-invalid:border-red-600"
      />
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  idleLabel,
  pending,
  pendingLabel,
}: Readonly<{
  idleLabel: string;
  pending: boolean;
  pendingLabel: string;
}>) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white transition hover:bg-stone-700 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
