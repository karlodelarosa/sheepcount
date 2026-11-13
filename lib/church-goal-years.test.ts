import { describe, expect, it } from "vitest";
import { getPlanningYears } from "./church-goal-years";

describe("church goal planning years", () => {
  it("allows planning one year ahead without any saved goals", () => {
    expect(getPlanningYears(2026, [], [])).toEqual([2027, 2026]);
  });

  it("keeps historical goal and theme years without duplicates", () => {
    expect(
      getPlanningYears(
        2026,
        [{ year: 2026 }, { year: 2024 }],
        [{ year: 2025 }, { year: 2024 }],
      ),
    ).toEqual([2027, 2026, 2025, 2024]);
  });

  it("advances the planning window when the calendar year changes", () => {
    expect(getPlanningYears(2027, [{ year: 2026 }], [])).toEqual([
      2028, 2027, 2026,
    ]);
  });
});
