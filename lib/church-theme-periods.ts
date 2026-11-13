import { MONTH_NAMES } from "./supabase/church-goals";
export type ThemeCadence = "monthly" | "quarterly";
export function matchesThemeCadence(
  theme: { cadence?: ThemeCadence },
  cadence: ThemeCadence,
) {
  return (theme.cadence ?? "monthly") === cadence;
}
export function getActiveThemePeriod(cadence: ThemeCadence, month: number) {
  return cadence === "quarterly" ? Math.ceil(month / 3) : month;
}
export function getThemePeriods(cadence: ThemeCadence) {
  return cadence === "quarterly"
    ? Array.from({ length: 4 }, (_, i) => ({
        number: i + 1,
        name: `Quarter ${i + 1}`,
        short: `Q${i + 1}`,
        range: `${MONTH_NAMES[i * 3]} – ${MONTH_NAMES[i * 3 + 2]}`,
      }))
    : MONTH_NAMES.map((name, i) => ({
        number: i + 1,
        name,
        short: name.slice(0, 3),
        range: "",
      }));
}
