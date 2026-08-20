import type { DedicationRecord } from "@/lib/supabase/dedications";

export type DedicationRegistryFilters = {
  search: string;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_DEDICATION_REGISTRY_FILTERS: DedicationRegistryFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
};

export function filterDedicationRecords(
  records: DedicationRecord[],
  filters: DedicationRegistryFilters,
): DedicationRecord[] {
  const searchLower = filters.search.toLowerCase().trim();

  return records
    .filter(record => {
      if (searchLower) {
        const haystack = [
          record.childName,
          record.parentNames,
          record.officiantName,
          record.location,
          record.notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      if (filters.dateFrom && record.dedicatedAt < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && record.dedicatedAt > filters.dateTo) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.dedicatedAt.localeCompare(a.dedicatedAt));
}

export function hasActiveDedicationFilters(
  filters: DedicationRegistryFilters,
): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}
