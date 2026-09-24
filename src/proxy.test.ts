import { describe, expect, it } from "vitest";

import { config } from "./proxy";

describe("Proxy matcher", () => {
  it("excludes framework assets and common image files", () => {
    expect(config.matcher).toEqual([
      "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ]);
  });
});
