"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSessionStats,
  type GroupedAttendanceRecord,
} from "../_lib/group-attendance";
import {
  AttendanceDetailsPanel,
  AttendanceRecordCard,
  formatLongDate,
} from "./attendance-session-card";
import { StatCard } from "./stat-card";

type LifeGroupServiceType = {
  id: string;
  name: string;
};

interface LifeGroupsTabProps {
  records: GroupedAttendanceRecord[];
  lifeGroupServiceTypes: LifeGroupServiceType[];
  people: Array<{
    id: string;
    name: string;
    householdName: string;
    membershipType: string;
    joinDate?: string;
  }>;
  onOpenSession: (record: GroupedAttendanceRecord) => void;
  onRecordAttendance: () => void;
}

export function LifeGroupsTab({
  records,
  lifeGroupServiceTypes,
  people,
  onOpenSession,
  onRecordAttendance,
}: LifeGroupsTabProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");
  const [selectedRecordKey, setSelectedRecordKey] = useState<string | null>(
    null,
  );

  const sessionCountByService = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of records) {
      counts.set(record.serviceId, (counts.get(record.serviceId) ?? 0) + 1);
    }
    return counts;
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (selectedServiceId === "all") return records;
    return records.filter((record) => record.serviceId === selectedServiceId);
  }, [records, selectedServiceId]);

  const stats = useMemo(
    () => getSessionStats(filteredRecords),
    [filteredRecords],
  );

  const selectedRecord = selectedRecordKey
    ? (filteredRecords.find(
        (record) =>
          `${record.serviceId}-${record.date}` === selectedRecordKey,
      ) ?? null)
    : null;

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedRecordKey(null);
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-200/50 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-950/10">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">Life groups &amp; other</CardTitle>
          <CardDescription className="text-xs">
            Fellowships, Sunday school, prayer meetings
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Filter by life group
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
              <Button
                type="button"
                size="sm"
                variant={selectedServiceId === "all" ? "default" : "outline"}
                className="h-7 shrink-0 text-xs px-2.5"
                onClick={() => handleSelectService("all")}
              >
                All
                {records.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 px-1 text-[10px] font-normal"
                  >
                    {records.length}
                  </Badge>
                )}
              </Button>
              {lifeGroupServiceTypes.map((serviceType) => {
                const count = sessionCountByService.get(serviceType.id) ?? 0;
                return (
                  <Button
                    key={serviceType.id}
                    type="button"
                    size="sm"
                    variant={
                      selectedServiceId === serviceType.id
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "h-7 shrink-0 text-xs px-2.5 max-w-[180px]",
                      selectedServiceId !== serviceType.id &&
                        count === 0 &&
                        "opacity-50",
                    )}
                    onClick={() => handleSelectService(serviceType.id)}
                  >
                    <span className="truncate">{serviceType.name}</span>
                    {count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 h-4 px-1 text-[10px] font-normal shrink-0"
                      >
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredRecords.length > 0 && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard
            variant="blue"
            label="Last session"
            value={stats.lastSessionCount}
            hint={
              stats.lastSessionDate
                ? formatLongDate(stats.lastSessionDate)
                : "No records"
            }
          />
          <StatCard
            variant="emerald"
            label="Sessions"
            value={stats.sessionCount}
            hint="Recorded"
          />
          <StatCard
            variant="violet"
            label="Average"
            value={stats.averageAttendance}
            hint="Per session"
          />
          <StatCard
            variant="rose"
            label="Total"
            value={stats.totalAttendance}
            hint="All time"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Records
          </h3>
          {filteredRecords.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <UsersRound className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  {records.length === 0
                    ? "No records yet"
                    : "No records for this life group"}
                </p>
                {records.length === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRecordAttendance}
                  >
                    Record attendance
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => {
                const key = `${record.serviceId}-${record.date}`;
                return (
                  <AttendanceRecordCard
                    key={key}
                    record={record}
                    compact
                    isSelected={selectedRecordKey === key}
                    onSelect={() => setSelectedRecordKey(key)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Details</h3>
          {selectedRecord ? (
            <AttendanceDetailsPanel
              record={selectedRecord}
              people={people}
              onOpenFullView={() => onOpenSession(selectedRecord)}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Select a record to preview
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
