import { describe, expect, it } from "vitest";

import { accentSurfaceVariants } from "./index";

describe("accentSurfaceVariants", () => {
  it("uses the solid accent surface by default", () => {
    expect(accentSurfaceVariants()).toBe(
      "bg-[var(--accent-color)] text-[var(--accent-color-foreground)]",
    );
  });

  it("provides a subtle accent surface", () => {
    expect(accentSurfaceVariants({ tone: "soft" })).toBe(
      "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]",
    );
  });

  it("provides an accent gradient surface", () => {
    expect(accentSurfaceVariants({ tone: "gradient" })).toBe(
      "bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color-strong)] text-[var(--accent-color-foreground)]",
    );
  });
});
