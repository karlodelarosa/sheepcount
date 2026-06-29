"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Church,
  UsersRound,
  LayoutDashboard,
  Cake,
} from "lucide-react";
import { usePeople } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import { buildSessionPath } from "@/lib/supabase/service-attendance";
import {
  RecordAttendanceDialog,
  NewAttendanceRecord,
} from "./_components/record-attendance-dialog";
import {
  groupAttendanceBySession,
  getSundayStats,
  getCurrentMonthRange,
  isSundayRecord,
  type GroupedAttendanceRecord,
  type DateRangeValue,
} from "./_lib/group-attendance";
import { AttendanceDashboardTab } from "./_components/attendance-dashboard-tab";
import { BirthdaysTab } from "./_components/birthdays-tab";
import { LifeGroupsTab } from "./_components/life-groups-tab";
import { StatCard } from "./_components/stat-card";
import {
  AttendanceDetailsPanel,
  AttendanceRecordCard,
  formatLongDate,
} from "./_components/attendance-session-card";

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

function getInitialDateRange(): DateRangeValue {
  return getCurrentMonthRange();
}

export function ServiceAttendanceView() {
  const router = useRouter();
  const { people, hydrated: peopleHydrated, addPerson } = usePeople();
  const {
    attendanceRows,
    serviceTypes,
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

  const [dateRange, setDateRange] = useState<DateRangeValue>(getInitialDateRange);

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
            <TabsTrigger value="birthdays" className="gap-1 text-xs px-2.5">
              <Cake className="w-3.5 h-3.5" />
              Birthdays
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
            <LifeGroupsTab
              records={otherRecords}
              lifeGroupServiceTypes={lifeGroupServiceTypes}
              people={people}
              onOpenSession={openSession}
              onRecordAttendance={() => setIsDialogOpen(true)}
            />
          </TabsContent>

          <TabsContent value="birthdays" className="mt-3">
            <BirthdaysTab people={people} />
          </TabsContent>
        </Tabs>
      )}

      <RecordAttendanceDialog
        serviceTypes={serviceTypes.map((s) => ({
          id: s.id,
          name: s.name,
          color: "violet",
        }))}
        defaultServiceId={primarySundayServiceId}
        people={people}
        onRecordAttendance={handleRecordAttendance}
        isSaving={isSaving}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
