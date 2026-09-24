import { createBrowserClient } from "@supabase/ssr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createClient } from "./client";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ kind: "browser-client" })),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("browser Supabase client", () => {
  it("uses the validated public project settings", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://example-project.supabase.co",
    );
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_example",
    );

    expect(createClient()).toEqual({ kind: "browser-client" });
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example-project.supabase.co",
      "sb_publishable_example",
    );
  });
});
