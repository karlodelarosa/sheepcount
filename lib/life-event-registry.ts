export type LifeEventQuickFilter = "all" | "year" | "missing";
export type LifeEventDateFilters = {
  search: string;
  dateFrom: string;
  dateTo: string;
};
export type LifeEventDatedRecord = { location: string; officiantName: string };

export function hasMissingLifeEventDetails(record: LifeEventDatedRecord) {
  return !record.location.trim() || !record.officiantName.trim();
}

export function filterLifeEventQuickRecords<T extends LifeEventDatedRecord>(
  records: T[],
  quick: LifeEventQuickFilter,
  getDate: (record: T) => string,
  year: number,
) {
  return records.filter(
    record =>
      quick === "all" ||
      (quick === "year"
        ? getDate(record).slice(0, 4) === String(year)
        : hasMissingLifeEventDetails(record)),
  );
}

export function getLifeEventCounts<T extends LifeEventDatedRecord>(
  records: T[],
  getDate: (record: T) => string,
  year: number,
) {
  return {
    all: records.length,
    year: filterLifeEventQuickRecords(records, "year", getDate, year).length,
    missing: filterLifeEventQuickRecords(records, "missing", getDate, year)
      .length,
  };
}

export function formatLifeEventDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
