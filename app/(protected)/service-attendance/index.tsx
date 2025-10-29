"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, ChevronRight, Plus, Search } from "lucide-react";
import { mockServiceTypes, mockServiceAttendance, mockPeople } from "@/components/mock-data";
import { RecordAttendanceDialog, NewAttendanceRecord } from "./_components/record-attendance-dialog";


export function ServiceAttendanceView() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<{ serviceId: string; date: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [serviceAttendance, setServiceAttendance] = useState(
    () => mockServiceAttendance.slice()
  );

  // Group attendance by service type and date
  const groupedAttendance = mockServiceAttendance.reduce((acc: any, record) => {
    const key = `${record.serviceId}-${record.date}`;
    if (!acc[key]) {
      acc[key] = {
        serviceId: record.serviceId,
        serviceType: record.serviceType,
        date: record.date,
        attendees: []
      };
    }
    acc[key].attendees.push(record.personId);
    return acc;
  }, {});

  const attendanceRecords = Object.values(groupedAttendance) as any[];
  attendanceRecords.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedAttendance = selectedService
    ? attendanceRecords.find(r => r.serviceId === selectedService.serviceId && r.date === selectedService.date)
    : null;

  const selectedAttendees = selectedAttendance
    ? selectedAttendance.attendees.map((id: string) => mockPeople.find(p => p.id === id)).filter(Boolean)
    : [];

  // Count evangelism attendees
  const evangelismCount = selectedAttendees.filter((p: any) => p.membershipType === "For Evangelism").length;

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
        <div className="flex flex-row gap-x-2">
        <Button variant="outline" className="gap-2" onClick={() => router.push(`service-attendance/search`)}>
          <Search className="w-4 h-4" />
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
          const serviceRecords = attendanceRecords.filter(r => r.serviceId === service.id);
          const totalAttendance = serviceRecords.reduce((sum, r) => sum + r.attendees.length, 0);

          return (
            <Card key={service.id} className="border-border/60 bg-card/50 backdrop-blur-sm">
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

      {/* Attendance Records */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3>Recent Attendance Records</h3>
          <div className="space-y-3">
            {attendanceRecords.map((record) => {
              const service = mockServiceTypes.find(s => s.id === record.serviceId);
              const isSelected = selectedService?.serviceId === record.serviceId && selectedService?.date === record.date;

              return (
                <Card
                  key={`${record.serviceId}-${record.date}`}
                  className={`
                    border-border/60 bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-foreground shadow-lg' 
                      : 'hover:shadow-lg hover:border-border'
                    }
                  `}
                  onClick={() => setSelectedService({ serviceId: record.serviceId, date: record.date })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${service?.color || 'blue'}-500 to-${service?.color || 'blue'}-700 flex items-center justify-center shadow-sm`}>
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-foreground">{record.serviceType}</p>
                          <p className="text-muted-foreground">{new Date(record.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
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

        {/* Detailed Attendance View */}
        <div className="space-y-4">
          <h3>Attendance Details</h3>
          {selectedAttendance ? (
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedAttendance.serviceType}</CardTitle>
                    <CardDescription>
                      {new Date(selectedAttendance.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {selectedAttendees.length} attendees
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {evangelismCount > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-900 dark:text-blue-100">
                        {evangelismCount} attendee{evangelismCount !== 1 ? 's' : ''} marked for evangelism follow-up
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-foreground">Attendees</h4>
                  <div className="space-y-2">
                    {selectedAttendees.map((person: any) => (
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
                        <div className="text-right">
                          <Badge 
                            variant={person.membershipType === "For Evangelism" ? "default" : "outline"}
                            className={person.membershipType === "For Evangelism" ? "bg-blue-500" : ""}
                          >
                            {person.membershipType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 space-y-2">
                  <Button className="w-full gap-2" onClick={() => {
                    router.push(`/service-attendance/${selectedAttendance.serviceId}---${selectedAttendance.date}`)
                  }}>
                    <Users className="w-4 h-4" />
                    Open full view
                  </Button>
                  <p className="text-muted-foreground text-center">
                    Add visitors for evangelism follow-up
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select an attendance record to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Overall attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-xl border border-border/60 bg-background/50">
              <p className="text-muted-foreground">Total Records</p>
              <p className="text-foreground">{attendanceRecords.length} sessions</p>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-background/50">
              <p className="text-muted-foreground">Total Attendance</p>
              <p className="text-foreground">
                {attendanceRecords.reduce((sum, r) => sum + r.attendees.length, 0)} people
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-background/50">
              <p className="text-muted-foreground">Average per Service</p>
              <p className="text-foreground">
                {Math.round(attendanceRecords.reduce((sum, r) => sum + r.attendees.length, 0) / attendanceRecords.length)} people
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border/60 bg-background/50">
              <p className="text-muted-foreground">Evangelism Prospects</p>
              <p className="text-foreground">
                {mockPeople.filter(p => p.membershipType === "For Evangelism").length} people
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <RecordAttendanceDialog
        serviceTypes={mockServiceTypes}
        people={mockPeople}
        onRecordAttendance={handleRecordAttendance}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
