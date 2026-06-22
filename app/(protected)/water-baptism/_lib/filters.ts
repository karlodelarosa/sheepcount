import type { BaptismRecord } from "@/lib/supabase/baptism";
import type { Person } from "@/lib/people";

export type BaptismRegistryFilters = {
  search: string;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_BAPTISM_REGISTRY_FILTERS: BaptismRegistryFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
};

export type BaptismRegistryRow = {
  person: Person;
  latestRecord: BaptismRecord;
  recordCount: number;
  allRecords: BaptismRecord[];
};

export function buildBaptismRegistryRows(
  records: BaptismRecord[],
  people: Person[],
  filters: BaptismRegistryFilters,
): BaptismRegistryRow[] {
  const peopleById = new Map(people.map(p => [p.id, p]));
  const recordsByPerson = new Map<string, BaptismRecord[]>();

  for (const record of records) {
    const existing = recordsByPerson.get(record.personId) ?? [];
    existing.push(record);
    recordsByPerson.set(record.personId, existing);
  }

  const rows: BaptismRegistryRow[] = [];

  for (const [personId, personRecords] of recordsByPerson) {
    const person = peopleById.get(personId);
    if (!person) continue;

    const sorted = [...personRecords].sort((a, b) =>
      b.baptizedAt.localeCompare(a.baptizedAt),
    );
    const latestRecord = sorted[0];
    if (!latestRecord) continue;

    rows.push({
      person,
      latestRecord,
      recordCount: sorted.length,
      allRecords: sorted,
    });
  }

  const searchLower = filters.search.toLowerCase().trim();

  return rows
    .filter(row => {
      if (searchLower) {
        const haystack = [
          row.person.name,
          row.latestRecord.location,
          row.latestRecord.notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      if (filters.dateFrom && row.latestRecord.baptizedAt < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && row.latestRecord.baptizedAt > filters.dateTo) {
        return false;
      }

      return true;
    })
    .sort((a, b) =>
      b.latestRecord.baptizedAt.localeCompare(a.latestRecord.baptizedAt),
    );
}

export function hasActiveBaptismFilters(filters: BaptismRegistryFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}
