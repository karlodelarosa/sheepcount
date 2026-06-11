export type PersonNameInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
};

export function formatPersonName({
  firstName,
  middleName,
  lastName,
}: PersonNameInput): string {
  return [firstName, middleName, lastName]
    .map(part => part?.trim())
    .filter(Boolean)
    .join(" ");
}
