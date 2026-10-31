export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
  defaultValue,
  helpText,
  inputRef,
  value,
  onChange,
}: Readonly<{
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete: string;
  error?: string;
  defaultValue?: string;
  helpText?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}>) {
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;

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
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        ref={inputRef}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [helpText ? helpId : null, error ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className="ui-field mt-2"
      />
      {helpText ? (
        <p id={helpId} className="mt-2 text-sm text-stone-500">
          {helpText}
        </p>
      ) : null}
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
