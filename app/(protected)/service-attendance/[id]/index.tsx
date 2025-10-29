"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Users, UserPlus, Edit2, Trash } from "lucide-react";
import { mockServiceTypes, mockServiceAttendance, mockPeople } from "@/components/mock-data";
import { useState } from "react";
import { RecordAttendanceDialog } from "../_components/record-attendance-dialog";

interface Props {
  attendanceId: string; // format: `${serviceId}---${date}`
}

export function AttendanceDetailsView({ attendanceId }: Props) {
  const router = useRouter();
  const [localAttendance, setLocalAttendance] = useState(() => mockServiceAttendance.slice());

  // Extract service & date from combined ID
  const [serviceId, date] = attendanceId.split("---");

  // Find the matching attendance records for this exact service/date
  const attendance = localAttendance.filter(
    (a) => a.serviceId === serviceId && a.date === date
  );

  const service = mockServiceTypes.find((s) => s.id === serviceId);
  const attendees = attendance
    .map((a) => mockPeople.find((p) => p.id === a.personId))
    .filter(Boolean) as any[];

  const evangelismCount = attendees.filter(
    (p: any) => p.membershipType === "For Evangelism"
  ).length;

  if (!service) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/service-attendance")}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Card className="border-destructive/50 text-destructive text-center">
          <CardContent className="p-6">
            Attendance not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Basic actions for prototype (edit/remove)
  const handleRemovePerson = (personId: string) => {
    setLocalAttendance((prev) => prev.filter((r) => !(r.serviceId === serviceId && r.date === date && r.personId === personId)));
  };

  const handleAddProspect = () => {
    // For prototype, just push a dummy prospect
    const newId = `p-${Date.now()}`;
    const newPerson = {
      id: newId,
      name: "New Prospect",
      householdName: "Prospect Household",
      membershipType: "For Evangelism",
    };
    // Not adding to mockPeople file; just create an attendance row
    setLocalAttendance((prev) => [
      {
        id: `gen-${serviceId}-${date}-${newId}`,
        serviceId,
        date,
        personId: newId,
        serviceType: service.name,
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/service-attendance")}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-foreground">{service.name}</h1>
          <p className="text-muted-foreground">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Attendance Summary */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance Summary
            </CardTitle>
            <CardDescription>
              Recorded attendees for this service
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {attendees.length} total
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Evangelism Highlight */}
          {evangelismCount > 0 && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              {evangelismCount} marked for evangelism follow-up
            </div>
          )}

          {/* Attendees List */}
          <div className="space-y-2">
            {attendees.length === 0 ? (
              <div className="text-center p-6">No attendees recorded.</div>
            ) : (
              attendees.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-sm">
                    <span className="text-white dark:text-slate-900">{person.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{person.name}</p>
                    <p className="text-muted-foreground">{person.householdName}</p>
                  </div>

                  <Badge
                    variant={
                      person.membershipType === "For Evangelism"
                        ? "default"
                        : "outline"
                    }
                    className={
                      person.membershipType === "For Evangelism"
                        ? "bg-blue-600"
                        : ""
                    }
                  >
                    {person.membershipType}
                  </Badge>

                  {/* Remove button (prototype) */}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemovePerson(person.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add visitor / non-member */}
          <div className="pt-3 border-t border-border/60">
            <Button className="w-full gap-2" onClick={handleAddProspect}>
              <UserPlus className="w-4 h-4" />
              Add Non-Member Attendee
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
