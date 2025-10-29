"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Calendar, Users, ChevronRight, Plus } from "lucide-react";
import {
  mockServiceTypes,
  mockServiceAttendance as mockServiceAttendanceFromFile,
  mockPeople,
} from "@/components/mock-data";
import { RecordAttendanceDialog, NewAttendanceRecord } from "./_components/record-attendance-dialog";

export function ServiceAttendanceView() {
  const router = useRouter();

  // Local modifiable attendance state (prototype only)
  const [serviceAttendance, setServiceAttendance] = useState(
    () => mockServiceAttendanceFromFile.slice()
  );

  const [selectedService, setSelectedService] = useState<{
    serviceId: string;
    date: string;
  } | null>(null);

  // Dialog control (we pass as controlled)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Group sessions by service + date into sessions (one session id per service+date)
  const attendanceRecords = useMemo(() => {
    const map: Record<
      string,
      {
        id: string;
        serviceId: string;
        serviceType: string;
        date: string;
        attendees: string[]; // personIds
      }
    > = {};

    for (const r of serviceAttendance) {
      const key = `${r.serviceId}---${r.date}`; // deterministic id for grouped session
      if (!map[key]) {
        map[key] = {
          id: key,
          serviceId: r.serviceId,
          serviceType: r.serviceType,
          date: r.date,
          attendees: [],
        };
      }
      map[key].attendees.push(r.personId);
    }

    const arr = Object.values(map);
    arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return arr;
  }, [serviceAttendance]);

  const selectedAttendance = selectedService
    ? attendanceRecords.find(
        (r) =>
          r.serviceId === selectedService.serviceId && r.date === selectedService.date
      ) ?? null
    : null;

  const selectedAttendees = selectedAttendance
    ? selectedAttendance.attendees
        .map((id) => mockPeople.find((p) => p.id === id))
        .filter(Boolean)
    : [];

  const evangelismCount = selectedAttendees.filter(
    (p: any) => p.membershipType === "For Evangelism"
  ).length;

  // handle new record from dialog (prototype: merge into serviceAttendance)
  const handleRecordAttendance = (newRecord: NewAttendanceRecord) => {
    // newRecord may include id (if created in dialog). If newRecord.id exists and it's a session-level id,
    // we will convert to individual attendance entries (one per person)
    // newRecord: { id?: string, serviceId, date, personIds }
    const toInsert = newRecord.personIds.map((pid) => ({
      id: newRecord.id ? `${newRecord.id}-${pid}` : `gen-${newRecord.serviceId}-${newRecord.date}-${pid}`,
      serviceId: newRecord.serviceId,
      date: newRecord.date,
      personId: pid,
      serviceType:
        mockServiceTypes.find((s) => s.id === newRecord.serviceId)?.name ||
        newRecord.serviceId,
    }));

    setServiceAttendance((prev) => {
      return [...toInsert, ...prev];
    });

    // open the newly created session's detail page (use generated session id)
    const sessionId = `${newRecord.serviceId}---${newRecord.date}`;
    router.push(`/service-attendance/${sessionId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Service Attendance</h1>
          <p className="text-muted-foreground">
            Track attendance for different services and events
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search button (placed above Recent Attendance per your choice B)
              We keep it here visually so it appears on the right side but
              it will be duplicated (rendered again above the list). This keeps header clean.
          */}
          <Button
            variant="outline"
            onClick={() => router.push("/service-attendance/search")}
            className="mr-2"
          >
            Search
          </Button>

          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Record Attendance
          </Button>
        </div>
      </div>

      {/* Service Types Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {mockServiceTypes.map((service) => {
          const serviceRecords = attendanceRecords.filter(
            (r) => r.serviceId === service.id
          );
          const totalAttendance = serviceRecords.reduce(
            (sum, r) => sum + r.attendees.length,
            0
          );

          return (
            <Card
              key={service.id}
              className="border-border/60 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground">{serviceRecords.length}</div>
                <p className="text-muted-foreground">Sessions recorded</p>
                <p className="text-muted-foreground mt-1">{totalAttendance} total</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search button (placement B: right above Recent Attendance Records) */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/service-attendance/search")}
          className="mb-2"
        >
          Search attendance
        </Button>
      </div>

      {/* Attendance Records */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3>Recent Attendance Records</h3>
          <div className="space-y-3">
            {attendanceRecords.map((record) => {
              const service = mockServiceTypes.find((s) => s.id === record.serviceId);
              const isSelected =
                selectedService?.serviceId === record.serviceId &&
                selectedService?.date === record.date;

              return (
                <Card
                  key={record.id}
                  className={`
                    border-border/60 bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-200
                    ${isSelected ? "ring-2 ring-foreground shadow-lg" : "hover:shadow-lg hover:border-border"}
                  `}
                  onClick={() =>
                    setSelectedService({ serviceId: record.serviceId, date: record.date })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center shadow-sm">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-foreground">{record.serviceType}</p>
                          <p className="text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1">
                          <Users className="w-3 h-3" />
                          {record.attendees.length}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Attendance Details */}
        <div className="space-y-4">
          <h3>Attendance Details</h3>
          {selectedAttendance ? (
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedAttendance.serviceType}</CardTitle>
                    <CardDescription>
                      {new Date(selectedAttendance.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {selectedAttendees.length} attendees
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-foreground">Attendees</h4>
                  <div className="space-y-1">
                    {selectedAttendees.map((person: any) => (
                      <div
                        key={person.id}
                        className="p-2 rounded-lg bg-background/30 flex items-center justify-between"
                      >
                        <span>{person.name}</span>
                        <Badge>{person.membershipType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/service-attendance/${selectedAttendance.id}`)
                  }
                >
                  Open Full View
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>Select attendance record</CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Record Attendance Dialog (controlled) */}
      <RecordAttendanceDialog
        serviceTypes={mockServiceTypes}
        people={mockPeople}
        onRecordAttendance={handleRecordAttendance}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        {/* We still provide a trigger child as a fallback (the header button already opens it) */}
        <Button onClick={() => setIsDialogOpen(true)} variant="default" className="gap-2">
          <Plus className="w-4 h-4" />
          Record Attendance
        </Button>
      </RecordAttendanceDialog>
    </div>
  );
}
