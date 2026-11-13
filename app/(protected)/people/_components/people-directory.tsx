"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDiscipleship } from "@/lib/discipleship";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import {
  usePeople,
  type AddPersonInput,
  type MembershipType,
  type Person,
} from "@/lib/people";
import { useTraining } from "@/lib/training";
import { buildPeopleDirectorySummary } from "../_lib/directory-summary";
import {
  buildPersonAchievementMap,
  filterPeople,
  type PeopleFilters,
} from "../_lib/filters";
import {
  buildPeopleListQuery,
  filtersFromSearchParams,
  parsePage,
  parsePageSize,
  PEOPLE_PAGE_SIZE_OPTIONS,
  savePeopleListNavigation,
  type PeoplePageSize,
} from "../_lib/list-state";
import { AddPersonDialog } from "./add-person-dialog";
import { ConfirmPersonDialog } from "./confirm-person-dialog";
import { PeopleDirectoryOverview } from "./people-directory-overview";
import {
  PeopleDirectoryTable,
  type DirectoryStatusAction,
} from "./people-directory-table";
import { PeopleFilterBar } from "./people-filter-bar";

const SEARCH_DEBOUNCE_MS = 250;

type PendingStatusChange = {
  person: Person;
  action: DirectoryStatusAction;
};

export function PeopleDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { people, hydrated, isSaving, addPerson, updatePerson } = usePeople();
  const { getPersonBadges } = useDiscipleship();
  const { getPersonTrainingBadges } = useTraining();
  const { lifeGroupMembers, lifeGroups, cellGroupMembers } =
    useGroupsMinistry();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);

  const page = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("size"));
  const filtersFromUrl = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const [searchInput, setSearchInput] = useState(filtersFromUrl.search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const isInternalSearchUrlUpdate = useRef(false);

  useEffect(() => {
    if (isInternalSearchUrlUpdate.current) {
      isInternalSearchUrlUpdate.current = false;
      return;
    }
    setSearchInput(filtersFromUrl.search);
  }, [filtersFromUrl.search]);

  useEffect(() => {
    if (debouncedSearch === filtersFromUrl.search) return;
    isInternalSearchUrlUpdate.current = true;
    const query = buildPeopleListQuery(1, pageSize, {
      ...filtersFromUrl,
      search: debouncedSearch,
    });
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [debouncedSearch, filtersFromUrl, pageSize, pathname, router]);

  const filters = useMemo(
    () => ({ ...filtersFromUrl, search: debouncedSearch }),
    [debouncedSearch, filtersFromUrl],
  );

  const updateListState = useCallback(
    (next: {
      page?: number;
      pageSize?: PeoplePageSize;
      filters?: PeopleFilters;
    }) => {
      const query = buildPeopleListQuery(
        next.page ?? page,
        next.pageSize ?? pageSize,
        next.filters ?? filters,
      );
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, page, pageSize, pathname, router],
  );

  const summary = useMemo(
    () => buildPeopleDirectorySummary(people, lifeGroupMembers),
    [lifeGroupMembers, people],
  );

  const lifeGroupByPersonId = useMemo(() => {
    const groupNames = new Map(lifeGroups.map(group => [group.id, group.name]));
    return new Map(
      lifeGroupMembers.map(membership => [
        membership.personId,
        groupNames.get(membership.lifeGroupId) ?? "Life group",
      ]),
    );
  }, [lifeGroupMembers, lifeGroups]);

  const achievementByPersonId = useMemo(
    () =>
      buildPersonAchievementMap(
        people,
        personId => getPersonBadges(personId).length,
        personId => getPersonTrainingBadges(personId).length,
      ),
    [getPersonBadges, getPersonTrainingBadges, people],
  );

  const cellGroupRoleByPersonId = useMemo(
    () =>
      new Map(cellGroupMembers.map(member => [member.personId, member.role])),
    [cellGroupMembers],
  );

  const filteredPeople = useMemo(
    () => filterPeople(people, filters, achievementByPersonId),
    [achievementByPersonId, filters, people],
  );
  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedPeople = filteredPeople.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleFiltersChange = (next: PeopleFilters) => {
    setSearchInput(next.search);
    updateListState({ filters: next, page: 1 });
  };

  const handleMembershipChange = (membershipType: MembershipType | "all") => {
    handleFiltersChange({ ...filters, membershipType });
  };

  const handlePageSizeChange = (value: string) => {
    updateListState({ pageSize: parsePageSize(value), page: 1 });
  };

  const navigateToPerson = (personId: string) => {
    const returnQuery = buildPeopleListQuery(safePage, pageSize, filters);
    savePeopleListNavigation({
      personIds: filteredPeople.map(person => person.id),
      page: safePage,
      pageSize,
      returnQuery,
    });
    router.push(`/people/${personId}`);
  };

  const handleAdd = async (
    input: AddPersonInput,
    { addAnother }: { addAnother: boolean },
  ) => {
    const person = await addPerson(input, { quiet: addAnother });
    return person !== null;
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const updated = await updatePerson(pendingStatusChange.person.id, {
      status: pendingStatusChange.action === "activate" ? "Active" : "Inactive",
    });
    if (updated) setPendingStatusChange(null);
  };

  if (!hydrated) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading people directory"
        className="space-y-5"
      >
        <div className="h-36 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted sm:h-40 lg:h-20" />
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <DirectoryTitleCard
        title="People"
        description="Manage everyone in your organization — members, attenders, and prospects."
        icon={UsersRound}
        action={{
          label: "Add Person",
          icon: Plus,
          onClick: () => setIsAddDialogOpen(true),
        }}
      />

      <PeopleDirectoryOverview
        summary={summary}
        activeMembership={filtersFromUrl.membershipType}
        onMembershipChange={handleMembershipChange}
      />

      <section aria-label="People directory" className="space-y-4">
        <PeopleFilterBar
          filters={{ ...filtersFromUrl, search: searchInput }}
          search={searchInput}
          onSearchChange={setSearchInput}
          onFiltersChange={handleFiltersChange}
        />

        <PeopleDirectoryTable
          people={paginatedPeople}
          achievementByPersonId={achievementByPersonId}
          lifeGroupByPersonId={lifeGroupByPersonId}
          cellGroupRoleByPersonId={cellGroupRoleByPersonId}
          onNavigate={navigateToPerson}
          onRequestStatusChange={(person, action) =>
            setPendingStatusChange({ person, action })
          }
        />

        {filteredPeople.length > 0 ? (
          <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground tabular-nums">
              Showing {(safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, filteredPeople.length)} of{" "}
              {filteredPeople.length}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {totalPages > 1 ? (
                <Pagination className="mx-0 w-auto justify-start">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={event => {
                          event.preventDefault();
                          updateListState({ page: Math.max(1, safePage - 1) });
                        }}
                        className={
                          safePage <= 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map(pageNumber => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={pageNumber === safePage}
                          onClick={event => {
                            event.preventDefault();
                            updateListState({ page: pageNumber });
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={event => {
                          event.preventDefault();
                          updateListState({
                            page: Math.min(totalPages, safePage + 1),
                          });
                        }}
                        className={
                          safePage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label="People per page"
                    className="w-20 rounded-lg"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PEOPLE_PAGE_SIZE_OPTIONS.map(size => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <AddPersonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAdd}
        isSaving={isSaving}
      />

      {pendingStatusChange ? (
        <ConfirmPersonDialog
          open
          onOpenChange={open => {
            if (!open && !isSaving) setPendingStatusChange(null);
          }}
          variant={pendingStatusChange.action}
          personName={pendingStatusChange.person.name}
          onConfirm={handleConfirmStatusChange}
          isLoading={isSaving}
        />
      ) : null}
    </div>
  );
}
