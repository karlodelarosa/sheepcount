"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Baby, Award, Cake, CalendarHeart, Users } from "lucide-react";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  getPersonVisitDate,
} from "@/lib/membership-path";
import {
  getBirthMonthShort,
  isBirthdayToday,
  isBirthMonth,
} from "@/lib/person-birthdate";
import { isChildByAge } from "@/lib/person-age";
import { usePeople, PEOPLE_PAGE_SIZE, type AddPersonInput } from "@/lib/people";
import { useDiscipleship } from "@/lib/discipleship";
import { useTraining } from "@/lib/training";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { AddPersonDialog } from "./add-person-dialog";
import { PeopleFilterBar } from "./people-filter-bar";
import { PersonAvatar } from "./person-detail-ui";
import {
  buildPersonAchievementMap,
  DEFAULT_PEOPLE_FILTERS,
  filterPeople,
  type PeopleFilters,
} from "../_lib/filters";

export function PeopleDirectory() {
  const router = useRouter();
  const { people, hydrated, isSaving, addPerson } = usePeople();
  const { getPersonBadges } = useDiscipleship();
  const { getPersonTrainingBadges } = useTraining();
  const { lifeGroupMembers, lifeGroups } = useGroupsMinistry();
  const [filters, setFilters] = useState<PeopleFilters>(DEFAULT_PEOPLE_FILTERS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const lifeGroupByPersonId = useMemo(() => {
    const map = new Map<string, string>();
    for (const membership of lifeGroupMembers) {
      const groupName =
        lifeGroups.find(group => group.id === membership.lifeGroupId)?.name ??
        "Life group";
      map.set(membership.personId, groupName);
    }
    return map;
  }, [lifeGroupMembers, lifeGroups]);

  const achievementByPersonId = useMemo(
    () =>
      buildPersonAchievementMap(
        people,
        personId => getPersonBadges(personId).length,
        personId => getPersonTrainingBadges(personId).length,
      ),
    [people, getPersonBadges, getPersonTrainingBadges],
  );

  const filteredPeople = useMemo(
    () => filterPeople(people, filters, achievementByPersonId),
    [people, filters, achievementByPersonId],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPeople.length / PEOPLE_PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPeople = filteredPeople.slice(
    (safePage - 1) * PEOPLE_PAGE_SIZE,
    safePage * PEOPLE_PAGE_SIZE,
  );

  const handleFiltersChange = (next: PeopleFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300";
      case "Exited":
        return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };

  const handleAdd = async (
    input: AddPersonInput,
    { addAnother }: { addAnother: boolean },
  ) => {
    const person = await addPerson(input, { quiet: addAnother });
    return person !== null;
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">
                People
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Manage everyone in your organization — members, attenders, and
                prospects
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add People
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PeopleFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            resultCount={filteredPeople.length}
          />

          <div className="flex flex-wrap items-center gap-3 px-1 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium uppercase tracking-wider">Legend</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full ring-2 ring-amber-400 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900" />
              Discipleship badge
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full ring-2 ring-emerald-400 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900" />
              Training completed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cake className="w-3.5 h-3.5 text-rose-500" />
              Birthday today
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarHeart className="w-3.5 h-3.5 text-pink-500" />
              Birth month
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Life group assigned
            </span>
          </div>

          <div className="border border-slate-200/60 rounded-xl overflow-hidden dark:border-zinc-700/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-100/50 dark:bg-zinc-700/70 dark:hover:bg-zinc-700/80">
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Name
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Birthday
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Life Group
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-300">
                    Type
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPeople.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-slate-500 dark:text-zinc-500"
                    >
                      No people found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPeople.map(person => {
                    const visitDate = getPersonVisitDate(person);
                    const achievement =
                      achievementByPersonId.get(person.id) ?? null;
                    const lifeGroupName = lifeGroupByPersonId.get(person.id);
                    const birthdayToday = isBirthdayToday(person.birthdate);
                    const birthMonth = isBirthMonth(person.birthdate);
                    const birthMonthLabel = getBirthMonthShort(person.birthdate);

                    return (
                      <TableRow
                        key={person.id}
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-900 dark:text-white transition-colors"
                        onClick={() => router.push(`/people/${person.id}`)}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(`/people/${person.id}`);
                          }
                        }}
                        tabIndex={0}
                        role="link"
                        aria-label={`View ${person.name}`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <PersonAvatar
                              name={person.name}
                              size="md"
                              achievement={achievement}
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                              {person.name}
                              {isChildByAge(person.age, person.birthdate) && (
                                <Badge
                                  className="rounded-lg gap-1 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300"
                                  title={`Age ${person.age}`}
                                >
                                  <Baby className="w-3 h-3" />
                                  Child
                                </Badge>
                              )}
                              {person.isProspect && (
                                <Badge className="rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                                  Prospect
                                </Badge>
                              )}
                              {achievement && (
                                <Badge
                                  className="rounded-lg gap-1 bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60"
                                  title={
                                    achievement === "both"
                                      ? "Discipleship and training achievements"
                                      : achievement === "discipleship"
                                        ? "Discipleship track completed"
                                        : "Training course completed"
                                  }
                                >
                                  <Award className="w-3 h-3" />
                                  {achievement === "both"
                                    ? "Achiever"
                                    : achievement === "discipleship"
                                      ? "Discipleship"
                                      : "Training"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {birthdayToday ? (
                              <Badge
                                className="rounded-lg gap-1 bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60"
                                title="Birthday today"
                              >
                                <Cake className="w-3 h-3" />
                                Birthday today
                              </Badge>
                            ) : birthMonth && birthMonthLabel ? (
                              <Badge
                                className="rounded-lg gap-1 bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/50"
                                title={`Birth month: ${birthMonthLabel}`}
                              >
                                <CalendarHeart className="w-3 h-3" />
                                {birthMonthLabel}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 dark:text-zinc-500 text-sm">
                                —
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lifeGroupName ? (
                            <Badge
                              className="rounded-lg gap-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 max-w-[10rem] truncate"
                              title={lifeGroupName}
                            >
                              <Users className="w-3 h-3 shrink-0" />
                              <span className="truncate">{lifeGroupName}</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-lg gap-1 text-slate-500 border-slate-200 dark:text-zinc-400 dark:border-zinc-600"
                            >
                              <Users className="w-3 h-3" />
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-lg ${getStatusColor(person.status)}`}
                          >
                            {person.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-lg ${getMembershipDisplayColor(person.membershipType, visitDate)}`}
                          >
                            {getMembershipDisplayLabel(
                              person.membershipType,
                              visitDate,
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredPeople.length > PEOPLE_PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(safePage - 1) * PEOPLE_PAGE_SIZE + 1}–
                {Math.min(safePage * PEOPLE_PAGE_SIZE, filteredPeople.length)}{" "}
                of {filteredPeople.length}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                      }}
                      className={
                        safePage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === safePage}
                          onClick={e => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
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
            </div>
          )}
        </CardContent>
      </Card>

      <AddPersonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAdd}
        isSaving={isSaving}
      />
    </div>
  );
}
