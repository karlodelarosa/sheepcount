"use client";

import {
  Award,
  Baby,
  Cake,
  CalendarHeart,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  getPersonVisitDate,
} from "@/lib/membership-path";
import type { Person } from "@/lib/people";
import { isChildByAge } from "@/lib/person-age";
import { isBirthdayToday, isBirthMonth } from "@/lib/person-birthdate";
import { cn } from "@/lib/utils";
import { formatLastAttended } from "../_lib/directory-summary";
import { PersonAvatar, type PersonAchievementKind } from "./person-detail-ui";

export type DirectoryStatusAction = "inactive" | "activate";

type PeopleDirectoryTableProps = {
  people: Person[];
  achievementByPersonId: Map<string, PersonAchievementKind>;
  lifeGroupByPersonId: Map<string, string>;
  cellGroupRoleByPersonId: Map<string, "Leader" | "Member">;
  onNavigate: (personId: string) => void;
  onRequestStatusChange: (
    person: Person,
    action: DirectoryStatusAction,
  ) => void;
};

function getStatusColor(status: Person["status"]) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-300";
    case "Inactive":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300";
    case "Exited":
      return "bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-300";
    case "Deceased":
      return "bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200";
  }
}

function getRowClassName(person: Person) {
  if (isBirthdayToday(person.birthdate)) {
    return "bg-rose-50/60 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/35";
  }
  if (person.status === "Inactive") {
    return "bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/25 dark:hover:bg-amber-950/40";
  }
  if (person.status === "Exited" || person.status === "Deceased") {
    return "bg-muted/50 opacity-75 hover:bg-muted/70";
  }
  return "hover:bg-muted/40";
}

export function PeopleDirectoryTable({
  people,
  achievementByPersonId,
  lifeGroupByPersonId,
  cellGroupRoleByPersonId,
  onNavigate,
  onRequestStatusChange,
}: PeopleDirectoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <Table className="min-w-[920px]">
        <TableHeader>
          <TableRow className="bg-muted/45 hover:bg-muted/45">
            <TableHead scope="col" className="h-11 min-w-[300px] px-4">
              Name
            </TableHead>
            <TableHead scope="col" className="h-11 min-w-40">
              Life Group
            </TableHead>
            <TableHead scope="col" className="h-11 min-w-36">
              Type
            </TableHead>
            <TableHead scope="col" className="h-11 min-w-28">
              Status
            </TableHead>
            <TableHead scope="col" className="h-11 min-w-36">
              Last Attended
            </TableHead>
            <TableHead scope="col" className="h-11 w-16 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-36 text-center">
                <p className="font-medium text-foreground">No people found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search or filters.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            people.map(person => {
              const visitDate = getPersonVisitDate(person);
              const achievement = achievementByPersonId.get(person.id) ?? null;
              const lifeGroupName = lifeGroupByPersonId.get(person.id);
              const cellGroupRole = cellGroupRoleByPersonId.get(person.id);
              const birthdayToday = isBirthdayToday(person.birthdate);
              const birthMonth =
                !birthdayToday && isBirthMonth(person.birthdate);

              return (
                <TableRow
                  key={person.id}
                  onClick={() => onNavigate(person.id)}
                  className={cn(
                    "cursor-pointer text-foreground",
                    getRowClassName(person),
                  )}
                >
                  <TableCell className="px-4 py-2.5 font-medium">
                    <button
                      type="button"
                      onClick={event => {
                        event.stopPropagation();
                        onNavigate(person.id);
                      }}
                      className="flex w-full items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2"
                      aria-label={`View ${person.name}`}
                    >
                      <PersonAvatar
                        name={person.name}
                        size="md"
                        achievement={achievement}
                      />
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="mr-1 truncate font-semibold">
                          {person.name}
                        </span>
                        {isChildByAge(person.age, person.birthdate) ? (
                          <Badge className="gap-1 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                            <Baby className="size-3" aria-hidden="true" />
                            Child
                          </Badge>
                        ) : null}
                        {person.isProspect ? (
                          <Badge className="rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Prospect
                          </Badge>
                        ) : null}
                        {cellGroupRole ? (
                          <Badge className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {cellGroupRole === "Leader"
                              ? "Cell Group Leader"
                              : "Cell Group Member"}
                          </Badge>
                        ) : null}
                        {achievement ? (
                          <Badge
                            className="gap-1 rounded-md border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300"
                            title={
                              achievement === "both"
                                ? "Discipleship and training achievements"
                                : achievement === "discipleship"
                                  ? "Discipleship track completed"
                                  : "Training course completed"
                            }
                          >
                            <Award className="size-3" aria-hidden="true" />
                            {achievement === "both"
                              ? "Achiever"
                              : achievement === "discipleship"
                                ? "Discipleship"
                                : "Training"}
                          </Badge>
                        ) : null}
                        {birthdayToday ? (
                          <Badge className="gap-1 rounded-md border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300">
                            <Cake className="size-3" aria-hidden="true" />
                            Birthday today
                          </Badge>
                        ) : birthMonth ? (
                          <Badge className="gap-1 rounded-md border border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800/50 dark:bg-pink-950/40 dark:text-pink-300">
                            <CalendarHeart
                              className="size-3"
                              aria-hidden="true"
                            />
                            Birth month
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell>
                    {lifeGroupName ? (
                      <Badge
                        className="max-w-40 gap-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        title={lifeGroupName}
                      >
                        <Users className="size-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{lifeGroupName}</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 rounded-md text-muted-foreground"
                      >
                        <Users className="size-3" aria-hidden="true" />
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md",
                        getMembershipDisplayColor(
                          person.membershipType,
                          visitDate,
                        ),
                      )}
                    >
                      {getMembershipDisplayLabel(
                        person.membershipType,
                        visitDate,
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md",
                        getStatusColor(person.status),
                      )}
                    >
                      {person.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatLastAttended(person.lastAttendance)}
                  </TableCell>
                  <TableCell
                    className="pr-3 text-right"
                    onClick={event => event.stopPropagation()}
                    onKeyDown={event => event.stopPropagation()}
                  >
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-11 rounded-lg text-muted-foreground hover:text-foreground"
                          aria-label={`Actions for ${person.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg"
                          onClick={() => onNavigate(person.id)}
                        >
                          <Eye className="size-4" />
                          View profile
                        </DropdownMenuItem>
                        {(person.status === "Active" ||
                          person.status === "Inactive") && (
                          <>
                            <DropdownMenuSeparator />
                            {person.status === "Active" ? (
                              <DropdownMenuItem
                                className="cursor-pointer rounded-lg"
                                onClick={() =>
                                  onRequestStatusChange(person, "inactive")
                                }
                              >
                                <UserX className="size-4" />
                                Mark inactive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer rounded-lg"
                                onClick={() =>
                                  onRequestStatusChange(person, "activate")
                                }
                              >
                                <UserCheck className="size-4" />
                                Mark active
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
