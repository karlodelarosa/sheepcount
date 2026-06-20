"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  ChevronRight,
  Plus,
  Search,
  Church,
  UsersRound,
  LayoutDashboard,
} from "lucide-react";
import { usePeople } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import { buildSessionPath } from "@/lib/supabase/service-attendance";
import { getMembershipDisplayLabel } from "@/lib/membership-path";
import {
  RecordAttendanceDialog,
  NewAttendanceRecord,
} from "./_components/record-attendance-dialog";
import {
  groupAttendanceBySession,
  getSundayStats,
  getDataDateBounds,
  isSundayRecord,
  type GroupedAttendanceRecord,
  type DateRangeValue,
} from "./_lib/group-attendance";
import { AttendanceDashboardTab } from "./_components/attendance-dashboard-tab";
import { StatCard } from "./_components/stat-card";

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toGroupedRows(
  rows: ReturnType<typeof useServiceAttendance>["attendanceRows"],
) {
  return groupAttendanceBySession(
    rows.map((r) => ({
      id: r.id,
      serviceId: r.serviceId,
      date: r.date,
      personId: r.personId,
      serviceType: r.serviceType,
      serviceCategory: r.serviceCategory,
    })),
  );
}

function AttendanceRecordCard({
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

function AttendanceDetailsPanel({
  record,
  people,
  onOpenFullView,
}: {
  record: GroupedAttendanceRecord;
  people: ReturnType<typeof usePeople>["people"];
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
                <p className="truncate text-sm">{person!.name}</p>
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

function getInitialDateRange(records: GroupedAttendanceRecord[]): DateRangeValue {
  const bounds = getDataDateBounds(records);
  if (bounds) return bounds;

  const to = new Date().toISOString().split("T")[0];
  const from = new Date();
  from.setMonth(from.getMonth() - 3);
  return { from: from.toISOString().split("T")[0], to };
}

export function ServiceAttendanceView() {
  const router = useRouter();
  const { people, hydrated: peopleHydrated, addPerson } = usePeople();
  const {
    attendanceRows,
    sundayServiceTypes,
    lifeGroupServiceTypes,
    primarySundayServiceId,
    hydrated,
    isSaving,
    recordAttendance,
  } = useServiceAttendance();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSunday, setSelectedSunday] = useState<{
    serviceId: string;
    date: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const attendanceRecords = useMemo(
    () => toGroupedRows(attendanceRows),
    [attendanceRows],
  );

  const dataBounds = useMemo(
    () => getDataDateBounds(attendanceRecords),
    [attendanceRecords],
  );

  const [dateRange, setDateRange] = useState<DateRangeValue>(() =>
    getInitialDateRange([]),
  );
  const dateRangeSynced = useRef(false);

  useEffect(() => {
    if (!hydrated || !dataBounds || dateRangeSynced.current) return;
    setDateRange(dataBounds);
    dateRangeSynced.current = true;
  }, [hydrated, dataBounds]);

  const sundayRecords = useMemo(
    () => attendanceRecords.filter(isSundayRecord),
    [attendanceRecords],
  );

  const otherRecords = useMemo(
    () => attendanceRecords.filter((r) => !isSundayRecord(r)),
    [attendanceRecords],
  );

  const sundayStats = useMemo(
    () => getSundayStats(attendanceRecords),
    [attendanceRecords],
  );

  const selectedSundayRecord = selectedSunday
    ? sundayRecords.find(
        (r) =>
          r.serviceId === selectedSunday.serviceId &&
          r.date === selectedSunday.date,
      )
    : null;

  const loading = !hydrated || !peopleHydrated;

  const handleRecordAttendance = async (newRecord: NewAttendanceRecord) => {
    const resolvedAttendees: {
      personId: string;
      timeOfArrival: string | null;
    }[] = [];

    for (const attendee of newRecord.attendees) {
      if (attendee.status === "new" && attendee.guestName) {
        const person = await addPerson(
          {
            firstName: attendee.guestName.firstName,
            lastName: attendee.guestName.lastName,
            membershipType: "Prospect",
          },
          { quiet: true },
        );
        if (!person) return false;

        resolvedAttendees.push({
          personId: person.id,
          timeOfArrival: attendee.timeOfArrival,
        });
        continue;
      }

      if (attendee.personId) {
        resolvedAttendees.push({
          personId: attendee.personId,
          timeOfArrival: attendee.timeOfArrival,
        });
      }
    }

    if (resolvedAttendees.length === 0) return false;

    const sessionId = await recordAttendance({
      serviceId: newRecord.serviceId,
      date: newRecord.date,
      attendees: resolvedAttendees,
    });

    if (!sessionId) return false;

    router.push(
      `/service-attendance/${buildSessionPath(newRecord.serviceId, newRecord.date)}`,
    );
    return true;
  };

  const openSession = (record: GroupedAttendanceRecord) => {
    router.push(
      `/service-attendance/${buildSessionPath(record.serviceId, record.date)}`,
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Service Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Sunday worship and life group gatherings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push("/service-attendance/search")}
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setIsDialogOpen(true)}
            disabled={isSaving || loading}
          >
            <Plus className="w-3.5 h-3.5" />
            Record
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-9 w-80" />
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="dashboard" className="gap-1 text-xs px-2.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="sunday" className="gap-1 text-xs px-2.5">
              <Church className="w-3.5 h-3.5" />
              Sunday
            </TabsTrigger>
            <TabsTrigger value="other" className="gap-1 text-xs px-2.5">
              <UsersRound className="w-3.5 h-3.5" />
              Life Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-3">
            <AttendanceDashboardTab
              attendanceRecords={attendanceRecords}
              rawAttendance={attendanceRows.map((r) => ({
                id: r.id,
                serviceId: r.serviceId,
                date: r.date,
                personId: r.personId,
                serviceType: r.serviceType,
                serviceCategory: r.serviceCategory,
              }))}
              people={people}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              dataBounds={dataBounds}
            />
          </TabsContent>

          <TabsContent value="sunday" className="space-y-4 mt-3">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <StatCard
                variant="violet"
                label="Last Sunday"
                value={sundayStats.lastSundayCount}
                hint={
                  sundayStats.lastSundayDate
                    ? formatLongDate(sundayStats.lastSundayDate)
                    : "No records"
                }
              />
              <StatCard
                variant="blue"
                label="Sessions"
                value={sundayStats.sessionCount}
                hint="Recorded"
              />
              <StatCard
                variant="emerald"
                label="Average"
                value={sundayStats.averageAttendance}
                hint="Per Sunday"
              />
              <StatCard
                variant="rose"
                label="Total"
                value={sundayStats.totalAttendance}
                hint="All time"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Records
                </h3>
                {sundayRecords.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <Church className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No Sunday attendance yet
                      </p>
                      <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                        Record attendance
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {sundayRecords.map((record) => (
                      <AttendanceRecordCard
                        key={`${record.serviceId}-${record.date}`}
                        record={record}
                        isSelected={
                          selectedSunday?.serviceId === record.serviceId &&
                          selectedSunday?.date === record.date
                        }
                        onSelect={() =>
                          setSelectedSunday({
                            serviceId: record.serviceId,
                            date: record.date,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Details</h3>
                {selectedSundayRecord ? (
                  <AttendanceDetailsPanel
                    record={selectedSundayRecord}
                    people={people}
                    onOpenFullView={() => openSession(selectedSundayRecord)}
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
          </TabsContent>

          <TabsContent value="other" className="mt-3">
            <Card className="border-blue-200/50 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-950/10">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Life groups &amp; other</CardTitle>
                <CardDescription className="text-xs">
                  Fellowships, Sunday school, prayer meetings
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {otherRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <UsersRound className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No records yet
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Record attendance
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {otherRecords.map((record) => (
                      <AttendanceRecordCard
                        key={`${record.serviceId}-${record.date}`}
                        record={record}
                        compact
                        onSelect={() => openSession(record)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <RecordAttendanceDialog
        serviceTypes={(activeTab === "other"
          ? lifeGroupServiceTypes
          : sundayServiceTypes
        ).map((s) => ({ id: s.id, name: s.name, color: "violet" }))}
        defaultServiceId={
          activeTab === "other"
            ? lifeGroupServiceTypes[0]?.id
            : primarySundayServiceId
        }
        people={people}
        onRecordAttendance={handleRecordAttendance}
        isSaving={isSaving}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
