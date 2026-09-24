import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, revalidatePath, rpc } = vi.hoisted(() => ({
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { grantEmployeeAccess, revokeEmployeeAccess } from "./actions";

function formData(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("employee access actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({ rpc });
  });

  it("normalizes an employee email and grants access through the trusted RPC", async () => {
    rpc.mockResolvedValue({ error: null });

    const state = await grantEmployeeAccess(
      {},
      formData({ employeeEmail: " EMPLOYEE@EXAMPLE.COM " }),
    );

    expect(rpc).toHaveBeenCalledWith("grant_restaurant_employee_access", {
      employee_email: "employee@example.com",
    });
    expect(state).toEqual({ success: "Employee access granted." });
    expect(revalidatePath).toHaveBeenCalledWith("/restaurant");
  });

  it("rejects invalid email before calling the database", async () => {
    const state = await grantEmployeeAccess(
      {},
      formData({ employeeEmail: "invalid" }),
    );

    expect(state.fieldError).toMatch(/valid employee email/i);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses one safe message for unavailable or unauthorized employee grants", async () => {
    rpc.mockResolvedValue({ error: new Error("employee_unavailable") });

    const state = await grantEmployeeAccess(
      {},
      formData({ employeeEmail: "missing@example.com" }),
    );

    expect(state.formError).toMatch(/no available employee account/i);
    expect(state.formError).not.toContain("employee_unavailable");
  });

  it("revokes access using the employee ID", async () => {
    rpc.mockResolvedValue({ error: null });
    const employeeId = "45c9c37a-50a2-4bc5-a14c-514513c06348";

    await revokeEmployeeAccess(formData({ employeeUserId: employeeId }));

    expect(rpc).toHaveBeenCalledWith("revoke_restaurant_employee_access", {
      target_employee_id: employeeId,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/restaurant");
  });

  it("ignores malformed employee IDs", async () => {
    await revokeEmployeeAccess(formData({ employeeUserId: "not-a-uuid" }));

    expect(createClient).not.toHaveBeenCalled();
  });
});
