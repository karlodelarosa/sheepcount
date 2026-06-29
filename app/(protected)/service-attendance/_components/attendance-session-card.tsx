"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Users } from "lucide-react";
import { getMembershipDisplayLabel } from "@/lib/membership-path";
import {
  isSundayRecord,
  type GroupedAttendanceRecord,
} from "../_lib/group-attendance";

export function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AttendanceRecordCard({
  record,
  isSelected,
  onSelect,
  compact = false,
}: {
  record: GroupedAttendanceRecord;
  isSelected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const sunday = isSundayRecord(record);

  return (
    <Card
      className={`
        border transition-all duration-150
        ${sunday ? "border-violet-200/60 dark:border-violet-800/40 bg-violet-50/30 dark:bg-violet-950/10" : "border-border/60 bg-card/50"}
        ${onSelect ? "cursor-pointer hover:shadow-md" : ""}
        ${isSelected ? "ring-2 ring-violet-500 shadow-md" : ""}
      `}
      onClick={onSelect}
    >
      <CardContent className={compact ? "p-2.5" : "p-3"}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`${compact ? "w-8 h-8" : "w-9 h-9"} rounded-lg flex items-center justify-center shrink-0 ${
                sunday
                  ? "bg-violet-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{record.serviceType}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {formatLongDate(record.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="gap-1 text-[10px] h-5 px-1.5">
              <Users className="w-3 h-3" />
              {record.attendees.length}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AttendanceDetailsPanel({
  record,
  people,
  onOpenFullView,
}: {
  record: GroupedAttendanceRecord;
  people: Array<{
    id: string;
    name: string;
    householdName: string;
    membershipType: string;
    joinDate?: string;
  }>;
  onOpenFullView: () => void;
}) {
  const attendees = record.attendees
    .map((id) => people.find((p) => p.id === id))
    .filter(Boolean);
  const evangelismCount = attendees.filter(
    (p) => p?.membershipType === "For Evangelism",
  ).length;

  return (
    <Card className="border-violet-200/60 dark:border-violet-800/40 bg-card/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm truncate">{record.serviceType}</CardTitle>
            <CardDescription className="text-xs">
              {formatLongDate(record.date)}
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-[10px] shrink-0">
            <Users className="w-3 h-3" />
            {attendees.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {evangelismCount > 0 && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100">
            {evangelismCount} for evangelism follow-up
          </div>
        )}

        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {attendees.map((person) => (
            <div
              key={person!.id}
              className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50 text-sm"
            >
              <div className="w-7 h-7 rounded-md bg-violet-500 text-white flex items-center justify-center text-xs shrink-0">
                {person!.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/people/${person!.id}`}
                  className="truncate text-sm font-medium hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {person!.name}
                </Link>
                <p className="text-[10px] text-muted-foreground truncate">
                  {person!.householdName}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {getMembershipDisplayLabel(
                  person!.membershipType,
                  person!.joinDate,
                )}
              </Badge>
            </div>
          ))}
        </div>

        <Button size="sm" className="w-full gap-1.5" onClick={onOpenFullView}>
          <Users className="w-3.5 h-3.5" />
          Open full view
        </Button>
      </CardContent>
    </Card>
  );
}
