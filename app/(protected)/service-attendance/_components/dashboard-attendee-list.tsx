"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getMembershipDisplayLabel, getPersonVisitDate } from "@/lib/membership-path";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_STATUS_LABELS,
  attendeeMatchesStatusFilter,
  getAttendeeStatusBadgeClass,
  getAttendeeStatusRowAccent,
  type AttendanceStatusKey,
} from "../_lib/attendance-breakdown";
import type { DashboardAttendeeSummary } from "../_lib/group-attendance";

interface DashboardAttendeeListProps {
  attendees: DashboardAttendeeSummary[];
  statusFilter: AttendanceStatusKey | null;
  onClearFilter: () => void;
}

export function DashboardAttendeeList({
  attendees,
  statusFilter,
  onClearFilter,
}: DashboardAttendeeListProps) {
  const filtered = attendees.filter(attendee =>
    attendeeMatchesStatusFilter(attendee, statusFilter),
  );

  return (
    <div className="space-y-3">
      {statusFilter && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-xs">
          <span>
            Showing{" "}
            <span className="font-medium">
              {ATTENDANCE_STATUS_LABELS[statusFilter]}
            </span>{" "}
            only
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1"
            onClick={onClearFilter}
          >
            <X className="w-3 h-3" />
            Clear
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {statusFilter
            ? "No people match this status filter."
            : "No attendees in this range."}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[28rem] overflow-y-auto">
          {filtered.map(attendee => {
            const visitDate = getPersonVisitDate(attendee);
            const statusLabel = getMembershipDisplayLabel(
              attendee.membershipType,
              visitDate,
            );

            return (
              <div
                key={attendee.personId}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/60 text-sm border-l-[3px]",
                  getAttendeeStatusRowAccent(attendee),
                )}
              >
                <div className="w-7 h-7 rounded-md bg-violet-500 text-white flex items-center justify-center text-xs shrink-0">
                  {attendee.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/people/${attendee.personId}`}
                    className="truncate block font-medium hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                  >
                    {attendee.name}
                  </Link>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {attendee.householdName || "No household"}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] tabular-nums shrink-0">
                  {attendee.attendanceCount}x
                </Badge>
                <Badge
                  className={cn(
                    "text-[10px] shrink-0 border",
                    getAttendeeStatusBadgeClass(attendee),
                  )}
                >
                  {statusLabel}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
