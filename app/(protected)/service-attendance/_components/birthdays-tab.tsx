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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cake,
  CalendarHeart,
  Search,
  UserCheck,
  UserX,
  Heart,
  Sparkles,
} from "lucide-react";
import type { Person, PersonStatus } from "@/lib/people";
import {
  getMembershipDisplayLabel,
  getPersonVisitDate,
} from "@/lib/membership-path";
import {
  formatBirthdayDisplay,
  getBirthdaySortKey,
  getBirthMonthShort,
  getMonthFullName,
  isBirthMonthIndex,
  isBirthdayToday,
  MONTH_NAMES,
} from "@/lib/person-birthdate";
import { isChildByAge } from "@/lib/person-age";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_STATUS_BADGE_CLASSES,
  classifyAttendeeStatus,
  type AttendanceStatusKey,
} from "../_lib/attendance-breakdown";

const STATUS_SECTIONS: {
  status: PersonStatus;
  title: string;
  description: string;
  icon: typeof UserCheck;
}[] = [
  {
    status: "Active",
    title: "Active Community",
    description: "People currently connected and active in the church",
    icon: UserCheck,
  },
  {
    status: "Inactive",
    title: "Currently Inactive",
    description: "People not presently active but still in the directory",
    icon: UserX,
  },
  {
    status: "Exited",
    title: "In Loving Memory",
    description: "Beloved members who have passed away",
    icon: Heart,
  },
];

const MEMBERSHIP_FILTER_ORDER: AttendanceStatusKey[] = [
  "Worker",
  "Volunteer",
  "Member",
  "Attender",
  "New Comer",
  "Visitor",
];

const DEFAULT_MEMBERSHIP_FILTER: Record<AttendanceStatusKey, boolean> = {
  Worker: true,
  Volunteer: true,
  Member: true,
  Attender: true,
  "New Comer": true,
  Visitor: true,
};

interface BirthdaysTabProps {
  people: Person[];
}

function sortByBirthday(a: Person, b: Person) {
  const keyA = getBirthdaySortKey(a.birthdate) ?? 9999;
  const keyB = getBirthdaySortKey(b.birthdate) ?? 9999;
  return keyA - keyB;
}

function personMembershipKey(person: Person): AttendanceStatusKey {
  return classifyAttendeeStatus({
    membershipType: person.membershipType,
    firstAttendance: person.firstAttendance,
    joinDate: person.joinDate,
  });
}

function matchesMembershipFilter(
  person: Person,
  filter: Record<AttendanceStatusKey, boolean>,
) {
  return filter[personMembershipKey(person)];
}

function BirthdayPersonRow({
  person,
  highlight = false,
}: {
  person: Person;
  highlight?: boolean;
}) {
  const router = useRouter();
  const birthdayLabel = formatBirthdayDisplay(person.birthdate);
  const birthdayToday = isBirthdayToday(person.birthdate);
  const birthMonthLabel = getBirthMonthShort(person.birthdate);
  const visitDate = getPersonVisitDate(person);
  const typeLabel = getMembershipDisplayLabel(person.membershipType, visitDate);
  const typeKey = personMembershipKey(person);

  return (
    <button
      type="button"
      onClick={() => router.push(`/people/${person.id}`)}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-lg border text-sm text-left transition-colors",
        highlight
          ? "border-rose-200/80 bg-rose-50/60 hover:bg-rose-50 dark:border-rose-800/50 dark:bg-rose-950/30 dark:hover:bg-rose-950/50"
          : "border-border/50 bg-background/60 hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-md text-white flex items-center justify-center text-xs shrink-0",
          highlight ? "bg-rose-500" : "bg-slate-600 dark:bg-zinc-600",
        )}
      >
        {person.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{person.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {person.householdName || "No household"}
          {person.age > 0 && ` · Age ${person.age}`}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
        <Badge
          className={cn(
            "text-[10px] border",
            ATTENDANCE_STATUS_BADGE_CLASSES[typeKey],
          )}
        >
          {typeLabel}
        </Badge>
        {isChildByAge(person.age, person.birthdate) && (
          <Badge variant="outline" className="text-[10px]">
            Child
          </Badge>
        )}
        {birthdayToday ? (
          <Badge className="text-[10px] gap-1 bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60">
            <Cake className="w-3 h-3" />
            Today
          </Badge>
        ) : birthMonthLabel ? (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 border-pink-200 text-pink-700 dark:border-pink-800/50 dark:text-pink-300"
          >
            <CalendarHeart className="w-3 h-3" />
            {birthMonthLabel}
          </Badge>
        ) : null}
        <span className="text-xs text-muted-foreground tabular-nums">
          {birthdayLabel}
        </span>
      </div>
    </button>
  );
}

export function BirthdaysTab({ people }: BirthdaysTabProps) {
  const now = new Date();
  const currentMonthIndex = now.getMonth();

  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [membershipFilter, setMembershipFilter] = useState(
    DEFAULT_MEMBERSHIP_FILTER,
  );

  const peopleWithBirthdays = useMemo(
    () => people.filter(p => p.birthdate && formatBirthdayDisplay(p.birthdate)),
    [people],
  );

  const baseFiltered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return peopleWithBirthdays.filter(person => {
      if (!matchesMembershipFilter(person, membershipFilter)) return false;
      if (!query) return true;
      return (
        person.name.toLowerCase().includes(query) ||
        person.householdName.toLowerCase().includes(query)
      );
    });
  }, [peopleWithBirthdays, search, membershipFilter]);

  const thisMonthBirthdays = useMemo(
    () =>
      baseFiltered
        .filter(p => isBirthMonthIndex(p.birthdate, currentMonthIndex))
        .sort(sortByBirthday),
    [baseFiltered, currentMonthIndex],
  );

  const selectedMonthBirthdays = useMemo(
    () =>
      baseFiltered
        .filter(p => isBirthMonthIndex(p.birthdate, selectedMonth))
        .sort(sortByBirthday),
    [baseFiltered, selectedMonth],
  );

  const groupedForMonth = useMemo(() => {
    return STATUS_SECTIONS.map(section => ({
      ...section,
      people: selectedMonthBirthdays
        .filter(p => p.status === section.status)
        .sort(sortByBirthday),
    }));
  }, [selectedMonthBirthdays]);

  const monthCounts = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    for (const person of baseFiltered) {
      const month = getBirthdaySortKey(person.birthdate);
      if (month === null) continue;
      const monthIndex = Math.floor(month / 100) - 1;
      if (monthIndex >= 0 && monthIndex < 12) counts[monthIndex]++;
    }
    return counts;
  }, [baseFiltered]);

  const missingBirthdateCount = people.length - peopleWithBirthdays.length;
  const todayCount = peopleWithBirthdays.filter(p =>
    isBirthdayToday(p.birthdate),
  ).length;

  const toggleMembership = (key: AttendanceStatusKey) => {
    setMembershipFilter(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  };

  const resetMembershipFilter = () =>
    setMembershipFilter({ ...DEFAULT_MEMBERSHIP_FILTER });

  const selectedMonthName = getMonthFullName(selectedMonth);
  const currentMonthName = getMonthFullName(currentMonthIndex);

  return (
    <div className="space-y-4">
      <Card className="border-rose-200/60 dark:border-rose-800/40 bg-rose-50/20 dark:bg-rose-950/10">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Cake className="w-4 h-4 text-rose-500" />
            Birthdays
          </CardTitle>
          <CardDescription className="text-xs">
            {peopleWithBirthdays.length} with birthdays on record
            {todayCount > 0 && ` · ${todayCount} celebrating today`}
            {missingBirthdateCount > 0 &&
              ` · ${missingBirthdateCount} without a birthdate`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-background/60">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search by name or household..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-0 bg-transparent h-8 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[17rem_1fr]">
            <div className="space-y-4 lg:pr-3 lg:border-r lg:border-border/50">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Membership type
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={resetMembershipFilter}
                  >
                    Select all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MEMBERSHIP_FILTER_ORDER.map(key => {
                    const active = membershipFilter[key];
                    return (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-7 text-xs px-2.5",
                          active && ATTENDANCE_STATUS_BADGE_CLASSES[key],
                        )}
                        onClick={() => toggleMembership(key)}
                      >
                        {key}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Browse by month
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {MONTH_NAMES.map((label, index) => {
                    const isCurrent = index === currentMonthIndex;
                    const isSelected = index === selectedMonth;
                    return (
                      <Button
                        key={label}
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "h-8 text-xs px-1 flex flex-col gap-0 leading-tight",
                          isCurrent &&
                            !isSelected &&
                            "border-rose-300 dark:border-rose-700",
                        )}
                        onClick={() => setSelectedMonth(index)}
                      >
                        <span>{label}</span>
                        {monthCounts[index] > 0 && (
                          <span className="text-[9px] opacity-70 tabular-nums">
                            {monthCounts[index]}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3 min-h-[16rem]">
              <div className="flex items-center justify-between gap-2 px-1">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarHeart className="w-4 h-4 text-pink-500" />
                  {selectedMonthName}
                </h3>
                <Badge variant="outline" className="text-[10px]">
                  {selectedMonthBirthdays.length} birthday
                  {selectedMonthBirthdays.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {selectedMonthBirthdays.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    No birthdays in {selectedMonthName} match your filters.
                  </CardContent>
                </Card>
              ) : (
                groupedForMonth.map(section => {
                  if (section.people.length === 0) return null;
                  const Icon = section.icon;

                  return (
                    <Card key={section.status} className="border-border/60 bg-card/50">
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <CardTitle className="text-sm flex items-center gap-1.5">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              {section.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {section.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {section.people.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <div className="space-y-1.5">
                          {section.people.map(person => (
                            <BirthdayPersonRow key={person.id} person={person} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-300/70 dark:border-rose-700/50 bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-transparent dark:from-rose-950/40 dark:via-pink-950/20">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Birthdays this month
              </CardTitle>
              <CardDescription className="text-xs">
                {currentMonthName} · {thisMonthBirthdays.length} celebrating
              </CardDescription>
            </div>
            <Badge className="bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 text-[10px]">
              {currentMonthName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {thisMonthBirthdays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No birthdays in {currentMonthName} match your filters.
            </p>
          ) : (
            <div className="space-y-1.5">
              {thisMonthBirthdays.map(person => (
                <BirthdayPersonRow key={person.id} person={person} highlight />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
