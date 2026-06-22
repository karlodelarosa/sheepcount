import type { PersonGender } from "@/lib/people";

export type AgeBracketKey =
  | "kids"
  | "youth"
  | "young_adults"
  | "adults"
  | "seniors"
  | "unknown";

export type AgeBracketFilter = Record<AgeBracketKey, boolean>;

export const AGE_BRACKET_LABELS: Record<AgeBracketKey, string> = {
  kids: "Kids (0–12)",
  youth: "Youth (13–21)",
  young_adults: "22–35",
  adults: "36–49",
  seniors: "50+",
  unknown: "Unknown",
};

export const AGE_BRACKET_COLORS: Record<AgeBracketKey, string> = {
  kids: "#38bdf8",
  youth: "#818cf8",
  young_adults: "#a78bfa",
  adults: "#6366f1",
  seniors: "#4f46e5",
  unknown: "#94a3b8",
};

export const DEFAULT_AGE_BRACKET_FILTER: AgeBracketFilter = {
  kids: true,
  youth: true,
  young_adults: true,
  adults: true,
  seniors: true,
  unknown: true,
};

export function getAgeBracket(
  age: number,
  birthdate?: string,
): AgeBracketKey {
  if (!birthdate || age <= 0) return "unknown";
  if (age <= 12) return "kids";
  if (age <= 21) return "youth";
  if (age <= 35) return "young_adults";
  if (age <= 49) return "adults";
  return "seniors";
}

export function matchesAgeBracketFilter(
  age: number,
  birthdate: string | undefined,
  filter: AgeBracketFilter,
): boolean {
  return filter[getAgeBracket(age, birthdate)];
}

export function hasActiveAgeBracketFilter(filter: AgeBracketFilter): boolean {
  return Object.values(filter).some(Boolean);
}

export type GenderKey = "male" | "female" | "unknown";

export const GENDER_LABELS: Record<GenderKey, string> = {
  male: "Male",
  female: "Female",
  unknown: "Unknown",
};

export const GENDER_COLORS: Record<GenderKey, string> = {
  male: "#3b82f6",
  female: "#ec4899",
  unknown: "#94a3b8",
};

export function getGenderKey(gender: PersonGender | null | undefined): GenderKey {
  if (gender === "Male") return "male";
  if (gender === "Female") return "female";
  return "unknown";
}
