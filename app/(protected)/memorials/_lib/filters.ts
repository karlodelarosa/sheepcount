import type { MemorialRecord } from "@/lib/supabase/memorials";

export type MemorialRegistryFilters = {
  search: string;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_MEMORIAL_REGISTRY_FILTERS: MemorialRegistryFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
};

export function filterMemorialRecords(
  records: MemorialRecord[],
  filters: MemorialRegistryFilters,
): MemorialRecord[] {
  const searchLower = filters.search.toLowerCase().trim();

  return records
    .filter(record => {
      if (searchLower) {
        const haystack = [
          record.deceasedName,
          record.officiantName,
          record.location,
          record.survivedBy,
          record.notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      if (filters.dateFrom && record.deathDate < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && record.deathDate > filters.dateTo) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.deathDate.localeCompare(a.deathDate));
}

export function hasActiveMemorialFilters(
  filters: MemorialRegistryFilters,
): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}
