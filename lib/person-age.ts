/** Maximum age (inclusive) to show the child indicator in the people directory. */
export const CHILD_MAX_AGE = 12;

export function isChildByAge(age: number, birthdate?: string): boolean {
  if (!birthdate || age <= 0) return false;
  return age <= CHILD_MAX_AGE;
}
