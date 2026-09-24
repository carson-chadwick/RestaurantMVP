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
    <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-stone-900">Employees</h2>
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
            className="mt-2 block w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
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
          className="self-start rounded-xl bg-stone-900 px-5 py-3 font-semibold text-white disabled:opacity-60 sm:mt-7"
        >
          {pending ? "Adding…" : "Grant access"}
        </button>
      </form>
      {state.formError ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="mt-3 text-sm text-green-700">
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
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {employee.first_name} {employee.last_name}
                  </p>
                  <p className="text-sm text-stone-600">{employee.email}</p>
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
