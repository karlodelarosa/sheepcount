import { describe, expect, it } from "vitest";

import {
  DEFAULT_ACCENT_COLOR,
  getAccentForeground,
  migrateLegacyAccentColor,
} from "./accent-color";

describe("getAccentForeground", () => {
  it("uses white foreground content on the default orange accent", () => {
    expect(getAccentForeground(DEFAULT_ACCENT_COLOR)).toBe("#ffffff");
  });

  it("keeps dark foreground content on very pale accent colors", () => {
    expect(getAccentForeground("#fde68a")).toBe("#030213");
  });
});

describe("migrateLegacyAccentColor", () => {
  it("migrates the legacy slate default to orange", () => {
    expect(migrateLegacyAccentColor("#030213")).toBe(DEFAULT_ACCENT_COLOR);
  });

  it("preserves explicitly selected accent colors", () => {
    expect(migrateLegacyAccentColor("#2563eb")).toBe("#2563eb");
  });
});
