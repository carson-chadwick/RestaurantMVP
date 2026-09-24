import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createClient } from "./server";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({ kind: "server-client" })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

type CookieAdapter = {
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    setAll: (
      cookies: Array<{
        name: string;
        value: string;
        options?: { httpOnly?: boolean };
      }>,
    ) => void;
  };
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("server Supabase client", () => {
  it("bridges Supabase cookies to the Next.js cookie store", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://example-project.supabase.co",
    );
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_example",
    );

    const cookieStore = {
      getAll: vi.fn(() => [{ name: "existing", value: "cookie" }]),
      set: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(
      cookieStore as unknown as Awaited<ReturnType<typeof cookies>>,
    );

    expect(await createClient()).toEqual({ kind: "server-client" });

    const options = vi.mocked(createServerClient).mock
      .calls[0][2] as CookieAdapter;
    expect(options.cookies.getAll()).toEqual([
      { name: "existing", value: "cookie" },
    ]);

    options.cookies.setAll([
      {
        name: "refreshed",
        value: "token",
        options: { httpOnly: true },
      },
    ]);

    expect(cookieStore.set).toHaveBeenCalledWith("refreshed", "token", {
      httpOnly: true,
    });
  });

  it("tolerates cookie writes from a read-only Server Component", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://example-project.supabase.co",
    );
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_example",
    );

    vi.mocked(cookies).mockResolvedValue({
      getAll: vi.fn(() => []),
      set: vi.fn(() => {
        throw new Error("Cookies can only be modified in a Server Action");
      }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    await createClient();
    const options = vi.mocked(createServerClient).mock
      .calls[0][2] as CookieAdapter;

    expect(() =>
      options.cookies.setAll([{ name: "refreshed", value: "token" }]),
    ).not.toThrow();
  });
});
