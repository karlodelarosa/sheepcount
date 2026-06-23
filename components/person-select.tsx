"use client";

import { useMemo } from "react";
import type { Person } from "@/lib/people";
import {
  SearchableSelect,
  type SearchableSelectOption,
  type SearchableSelectProps,
} from "@/components/ui/searchable-select";

export type PersonSelectPerson = Pick<Person, "id" | "name"> &
  Partial<
    Pick<
      Person,
      | "firstName"
      | "middleName"
      | "lastName"
      | "householdName"
      | "householdId"
      | "email"
      | "phone"
      | "role"
    >
  >;

export function personSearchKeywords(person: PersonSelectPerson): string {
  return [
    person.name,
    person.firstName,
    person.middleName,
    person.lastName,
    person.householdName,
    person.email,
    person.phone,
    person.role,
  ]
    .filter(Boolean)
    .join(" ");
}

export function defaultPersonLabel(person: PersonSelectPerson): string {
  const household = person.householdName?.trim();
  return household ? `${person.name} - ${household}` : person.name;
}

export type PersonSelectProps = Omit<
  SearchableSelectProps,
  "options" | "emptyMessage"
> & {
  people: PersonSelectPerson[];
  formatLabel?: (person: PersonSelectPerson) => string;
  emptyMessage?: string;
};

export function PersonSelect({
  people,
  formatLabel = defaultPersonLabel,
  emptyMessage = "No people found",
  ...props
}: PersonSelectProps) {
  const options = useMemo<SearchableSelectOption[]>(
    () =>
      people.map(person => ({
        value: person.id,
        label: formatLabel(person),
        keywords: personSearchKeywords(person),
      })),
    [people, formatLabel],
  );

  return (
    <SearchableSelect
      options={options}
      emptyMessage={emptyMessage}
      searchPlaceholder="Search people..."
      {...props}
    />
  );
}
