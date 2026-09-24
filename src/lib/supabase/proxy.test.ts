// @vitest-environment node

import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { updateSession } from "./proxy";

const getClaims = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({ auth: { getClaims } })),
}));

type CookieAdapter = {
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    setAll: (
      cookies: Array<{
        name: string;
        value: string;
        options?: { httpOnly?: boolean; sameSite?: "lax" };
      }>,
    ) => void;
  };
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("Supabase session Proxy", () => {
  it("verifies claims and propagates refreshed cookies", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://example-project.supabase.co",
    );
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_example",
    );
    getClaims.mockResolvedValue({ data: { claims: null }, error: null });

    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: { cookie: "existing=cookie" },
    });
    const responsePromise = updateSession(request);

    const options = vi.mocked(createServerClient).mock
      .calls[0][2] as CookieAdapter;
    expect(options.cookies.getAll()).toEqual([
      { name: "existing", value: "cookie" },
    ]);

    options.cookies.setAll([
      {
        name: "refreshed",
        value: "token",
        options: { httpOnly: true, sameSite: "lax" },
      },
    ]);

    const response = await responsePromise;

    expect(getClaims).toHaveBeenCalledOnce();
    expect(request.cookies.get("refreshed")?.value).toBe("token");
    expect(response.cookies.get("refreshed")?.value).toBe("token");
  });
});
