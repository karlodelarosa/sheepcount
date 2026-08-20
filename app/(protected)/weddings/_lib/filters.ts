import type { WeddingRecord } from "@/lib/supabase/weddings";

export type WeddingRegistryFilters = {
  search: string;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_WEDDING_REGISTRY_FILTERS: WeddingRegistryFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
};

export function filterWeddingRecords(
  records: WeddingRecord[],
  filters: WeddingRegistryFilters,
): WeddingRecord[] {
  const searchLower = filters.search.toLowerCase().trim();

  return records
    .filter(record => {
      if (searchLower) {
        const haystack = [
          record.spouse1Name,
          record.spouse2Name,
          record.officiantName,
          record.location,
          record.notes,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      if (filters.dateFrom && record.marriedAt < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && record.marriedAt > filters.dateTo) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.marriedAt.localeCompare(a.marriedAt));
}

export function hasActiveWeddingFilters(
  filters: WeddingRegistryFilters,
): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}
