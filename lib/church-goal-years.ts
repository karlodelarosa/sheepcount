export function getPlanningYears(
  currentYear: number,
  goals: readonly { year: number }[],
  themes: readonly { year: number }[],
): number[] {
  const years = new Set([currentYear, currentYear + 1]);
  for (const goal of goals) years.add(goal.year);
  for (const theme of themes) years.add(theme.year);
  return Array.from(years).sort((a, b) => b - a);
}
