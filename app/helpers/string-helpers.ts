export function getInitials(firstName: string, lastName: string): string {
  const getFirstLetter = (value: string) =>
    value?.trim().charAt(0).toUpperCase() ?? "";

  const firstInitial = getFirstLetter(firstName);
  const lastInitial = getFirstLetter(lastName);

  return `${firstInitial}${lastInitial}`;
}
