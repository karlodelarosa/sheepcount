"use client";

import {
  Clock,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard } from "./stat-card";
import {
  classifyArrival,
  formatArrivalStatusLabel,
  type AttendanceOverviewStats,
  type SelectedAttendee,
} from "../_lib/attendance-workflow";

interface AttendanceOverviewStepProps {
  attendees: SelectedAttendee[];
  serviceStartTime: string;
  stats: AttendanceOverviewStats;
  serviceName: string;
  attendanceDate: string;
}

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function AttendanceOverviewStep({
  attendees,
  serviceStartTime,
  stats,
  serviceName,
  attendanceDate,
}: AttendanceOverviewStepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="font-medium">{serviceName}</p>
        <p className="text-muted-foreground">{formatLongDate(attendanceDate)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Service start: {serviceStartTime}
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <StatCard
          variant="violet"
          label="Total"
          value={stats.total}
          hint="Headcount"
          icon={Users}
        />
        <StatCard
          variant="blue"
          label="Members"
          value={stats.members}
          hint="Existing roster"
          icon={UserCheck}
        />
        <StatCard
          variant="emerald"
          label="New Guests"
          value={stats.newGuests}
          hint="Quick-added visitors"
          icon={UserPlus}
        />
        <StatCard
          variant="emerald"
          label="Early"
          value={stats.early}
          hint="Before service start"
          icon={Clock}
        />
        <StatCard
          variant="blue"
          label="On-Time"
          value={stats.onTime}
          hint="Start to +5 min"
          icon={Clock}
        />
        <StatCard
          variant="amber"
          label="Late"
          value={stats.late}
          hint="More than 5 min late"
          icon={Clock}
        />
      </div>

      <div className="space-y-2">
        <Label>Attendee breakdown</Label>
        <ScrollArea className="h-48 rounded-xl border">
          <div className="divide-y">
            {attendees.map((attendee) => {
              const arrivalStatus = classifyArrival(
                attendee.timeOfArrival,
                serviceStartTime,
              );

              return (
                <div
                  key={attendee.key}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{attendee.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {attendee.status === "new" ? "New guest" : "Member"}
                      {attendee.timeOfArrival
                        ? ` · ${attendee.timeOfArrival}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {arrivalStatus && (
                      <Badge variant="outline" className="text-[10px]">
                        {formatArrivalStatusLabel(arrivalStatus)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
