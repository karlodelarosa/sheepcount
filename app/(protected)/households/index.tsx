"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePeople } from "@/lib/people";
import { AddHouseholdDialog } from "./_components/add-household-dialog";
import { HouseholdDirectoryCard } from "./_components/household-directory-card";
import { HouseholdDirectoryControls } from "./_components/household-directory-controls";
import { HouseholdDirectoryHeader } from "./_components/household-directory-header";
import { HouseholdDirectoryPagination } from "./_components/household-directory-pagination";
import {
  EmptyHouseholdDirectory,
  HouseholdDirectorySkeleton,
  NoMatchingHouseholds,
} from "./_components/household-directory-states";
import {
  buildHouseholdDirectoryEntries,
  buildHouseholdDirectoryQuery,
  buildHouseholdDirectorySummary,
  filterHouseholdDirectory,
  getHouseholdDirectoryState,
  type HouseholdDirectoryFilter,
  type HouseholdDirectoryState,
  type HouseholdPageSize,
} from "./_lib/directory";

const SEARCH_DEBOUNCE_MS = 250;

export function HouseholdsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { households, people, hydrated } = usePeople();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const directoryState = useMemo(
    () =>
      getHouseholdDirectoryState(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [searchInput, setSearchInput] = useState(directoryState.search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setSearchInput(directoryState.search);
  }, [directoryState.search]);

  useEffect(() => {
    if (debouncedSearch === directoryState.search) return;

    const query = buildHouseholdDirectoryQuery({
      ...directoryState,
      search: debouncedSearch,
      page: 1,
    });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [debouncedSearch, directoryState, pathname, router]);

  const updateListState = useCallback(
    (updates: Partial<HouseholdDirectoryState>) => {
      const query = buildHouseholdDirectoryQuery({
        ...directoryState,
        search: searchInput,
        ...updates,
      });
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [directoryState, pathname, router, searchInput],
  );

  const entries = useMemo(
    () => buildHouseholdDirectoryEntries(households, people),
    [households, people],
  );
  const summary = useMemo(
    () => buildHouseholdDirectorySummary(entries),
    [entries],
  );
  const missingAddressCount = useMemo(
    () => entries.filter(entry => !entry.household.address.trim()).length,
    [entries],
  );
  const filteredEntries = useMemo(
    () =>
      filterHouseholdDirectory(entries, debouncedSearch, directoryState.filter),
    [debouncedSearch, directoryState.filter, entries],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEntries.length / directoryState.pageSize),
  );
  const safePage = Math.min(directoryState.page, totalPages);
  const visibleEntries = filteredEntries.slice(
    (safePage - 1) * directoryState.pageSize,
    safePage * directoryState.pageSize,
  );

  const handleFilterChange = (filter: HouseholdDirectoryFilter) => {
    updateListState({ filter, page: 1 });
  };

  const handlePageSizeChange = (pageSize: HouseholdPageSize) => {
    updateListState({ pageSize, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput("");
    updateListState({ search: "", filter: "all", page: 1 });
  };

  if (!hydrated) return <HouseholdDirectorySkeleton />;

  return (
    <div className="space-y-5 pb-4">
      <HouseholdDirectoryHeader
        summary={summary}
        onAddHousehold={() => setIsAddDialogOpen(true)}
      />

      {entries.length === 0 ? (
        <EmptyHouseholdDirectory
          onAddHousehold={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <section aria-label="Household directory" className="space-y-4">
          <HouseholdDirectoryControls
            search={searchInput}
            activeFilter={directoryState.filter}
            summary={summary}
            missingAddressCount={missingAddressCount}
            onSearchChange={setSearchInput}
            onFilterChange={handleFilterChange}
          />

          {filteredEntries.length === 0 ? (
            <NoMatchingHouseholds onClearFilters={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleEntries.map(entry => (
                <HouseholdDirectoryCard
                  key={entry.household.id}
                  entry={entry}
                />
              ))}
            </div>
          )}

          {filteredEntries.length > 0 ? (
            <HouseholdDirectoryPagination
              page={safePage}
              pageSize={directoryState.pageSize}
              totalItems={filteredEntries.length}
              onPageChange={page => updateListState({ page })}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : null}
        </section>
      )}

      <AddHouseholdDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
