"use client";

import { useActionState } from "react";

import { grantEmployeeAccess, revokeEmployeeAccess } from "./actions";

type Employee = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export function EmployeeManagement({
  employees,
}: Readonly<{ employees: Employee[] }>) {
  const [state, formAction, pending] = useActionState(grantEmployeeAccess, {});

  return (
    <section className="ui-card mt-10 p-6 sm:p-8">
      <p className="ui-eyebrow">Team access</p>
      <h2 className="mt-3 text-3xl text-[var(--ink)]">Employees</h2>
      <p className="mt-2 text-stone-600">
        Employees must create their own account before you grant access.
      </p>
      <form
        action={formAction}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        noValidate
      >
        <div className="flex-1">
          <label
            htmlFor="employeeEmail"
            className="block text-sm font-medium text-stone-800"
          >
            Employee email
          </label>
          <input
            id="employeeEmail"
            name="employeeEmail"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldError)}
            aria-describedby={
              state.fieldError ? "employee-email-error" : undefined
            }
            className="ui-field mt-2"
          />
          {state.fieldError ? (
            <p id="employee-email-error" className="mt-2 text-sm text-red-700">
              {state.fieldError}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="ui-button-primary self-start disabled:opacity-60 sm:mt-7"
        >
          {pending ? "Adding…" : "Grant access"}
        </button>
      </form>
      {state.formError ? (
        <p role="alert" className="ui-status-error mt-3 text-sm">
          {state.formError}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="ui-status-success mt-3 text-sm">
          {state.success}
        </p>
      ) : null}

      <div className="mt-8 border-t border-stone-200 pt-6">
        {employees.length === 0 ? (
          <p className="text-stone-600">No employees have access yet.</p>
        ) : (
          <ul className="divide-y divide-stone-200">
            {employees.map((employee) => (
              <li
                key={employee.user_id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-sm break-all text-stone-600">
                    {employee.email}
                  </p>
                </div>
                <form action={revokeEmployeeAccess}>
                  <input
                    type="hidden"
                    name="employeeUserId"
                    value={employee.user_id}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Revoke
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
