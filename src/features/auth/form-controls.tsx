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
        className="block text-sm font-semibold text-[var(--ink)]"
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
        className="ui-field mt-2"
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
      className="ui-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
