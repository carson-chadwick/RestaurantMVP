import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseConfig } from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSupabaseConfig", () => {
  it("returns validated public Supabase configuration", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://example-project.supabase.co",
    );
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_example",
    );

    expect(getSupabaseConfig()).toEqual({
      url: "https://example-project.supabase.co",
      publishableKey: "sb_publishable_example",
    });
  });

  it("rejects missing configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(() => getSupabaseConfig()).toThrow();
  });

  it("rejects a malformed project URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_example",
    );

    expect(() => getSupabaseConfig()).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid URL.",
    );
  });
});
