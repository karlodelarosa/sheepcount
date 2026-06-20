"use client";

import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  classifyArrival,
  formatArrivalStatusLabel,
  getToggleTime,
  type ArrivalStatus,
  type SelectedAttendee,
} from "../_lib/attendance-workflow";

interface AttendanceTimestampStepProps {
  attendees: SelectedAttendee[];
  serviceStartTime: string;
  onUpdateArrivalTime: (key: string, timeOfArrival: string) => void;
  onApplyToggleToAll: (toggle: ArrivalStatus) => void;
}

function ArrivalToggleButtons({
  activeToggle,
  onSelect,
}: {
  activeToggle: ArrivalStatus | null;
  onSelect: (toggle: ArrivalStatus) => void;
}) {
  const toggles: ArrivalStatus[] = ["early", "on-time", "late"];

  return (
    <div className="flex flex-wrap gap-1">
      {toggles.map((toggle) => (
        <Button
          key={toggle}
          type="button"
          size="sm"
          variant={activeToggle === toggle ? "default" : "outline"}
          className="h-7 px-2 text-[11px]"
          onClick={() => onSelect(toggle)}
        >
          {formatArrivalStatusLabel(toggle)}
        </Button>
      ))}
    </div>
  );
}

export function AttendanceTimestampStep({
  attendees,
  serviceStartTime,
  onUpdateArrivalTime,
  onApplyToggleToAll,
}: AttendanceTimestampStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            Service start baseline:{" "}
            <span className="font-medium tabular-nums">{serviceStartTime}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Apply to all:</span>
          {(["early", "on-time", "late"] as ArrivalStatus[]).map((toggle) => (
            <Button
              key={toggle}
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={() => onApplyToggleToAll(toggle)}
            >
              {formatArrivalStatusLabel(toggle)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Arrival times ({attendees.length})</Label>
        <ScrollArea className="h-[min(420px,50vh)] rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[18%]">Time</TableHead>
                <TableHead>Quick set</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((attendee) => {
                const arrivalStatus = classifyArrival(
                  attendee.timeOfArrival,
                  serviceStartTime,
                );
                const activeToggle =
                  attendee.timeOfArrival ===
                    getToggleTime(serviceStartTime, "early")
                    ? "early"
                    : attendee.timeOfArrival ===
                        getToggleTime(serviceStartTime, "on-time")
                      ? "on-time"
                      : attendee.timeOfArrival ===
                          getToggleTime(serviceStartTime, "late")
                        ? "late"
                        : arrivalStatus;

                return (
                  <TableRow key={attendee.key}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{attendee.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {attendee.householdName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          attendee.status === "new" ? "secondary" : "outline"
                        }
                        className="text-[10px]"
                      >
                        {attendee.status === "new" ? "New Guest" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={attendee.timeOfArrival}
                        onChange={(e) =>
                          onUpdateArrivalTime(attendee.key, e.target.value)
                        }
                        className="h-8 w-[7.5rem] tabular-nums"
                      />
                    </TableCell>
                    <TableCell>
                      <ArrivalToggleButtons
                        activeToggle={activeToggle}
                        onSelect={(toggle) =>
                          onUpdateArrivalTime(
                            attendee.key,
                            getToggleTime(serviceStartTime, toggle),
                          )
                        }
                      />
                      {arrivalStatus && (
                        <p
                          className={cn(
                            "mt-1 text-[10px] font-medium",
                            arrivalStatus === "early" && "text-emerald-600",
                            arrivalStatus === "on-time" && "text-blue-600",
                            arrivalStatus === "late" && "text-amber-600",
                          )}
                        >
                          {formatArrivalStatusLabel(arrivalStatus)}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
