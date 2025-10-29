"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { mockPeople, mockAttendance } from "@/components/mock-data";
import { RecordAttendanceDialog } from "./_components/record-attendance-dialog";

export function AttendanceView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);

  // Get attendance for selected date
  const dateAttendance = mockAttendance
    .filter(a => {
      if (!selectedDate) return false;
      const attendanceDate = new Date(a.date);
      return attendanceDate.toDateString() === selectedDate.toDateString();
    })
    .map(record => ({
      ...record,
      person: mockPeople.find(p => p.id === record.personId)
    }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view or record attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-xl border border-slate-200/60"
            />
          </CardContent>
        </Card>

        {/* Attendance for Selected Date */}
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  {selectedDate?.toLocaleDateString() || "No date selected"}
                </CardDescription>
              </div>
              <Button onClick={() => setIsRecordDialogOpen(true)} className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20">
                <Plus className="w-4 h-4 mr-2" />
                Record
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dateAttendance.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No attendance records for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dateAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border border-slate-200/60 rounded-xl hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-sm">
                        <span className="text-white">{record.person?.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-slate-900">{record.person?.name}</p>
                        <p className="text-slate-600">{record.person?.householdName}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-lg">{record.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Summary */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Attendance Summary</CardTitle>
          <CardDescription>Overview of attendance from the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const count = mockAttendance.filter(a => 
                new Date(a.date).toDateString() === date.toDateString()
              ).length;
              
              return (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900">{count} attendees</span>
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-slate-900 to-slate-700 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(count / mockPeople.length * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <RecordAttendanceDialog 
        open={isRecordDialogOpen} 
        onOpenChange={setIsRecordDialogOpen}
        selectedDate={selectedDate}
      />
    </div>
  );
}