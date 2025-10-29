"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockServiceAttendance, mockPeople } from "@/components/mock-data";
import { ArrowLeft } from "lucide-react";

/**
 * Search filters: name + status + date (Version B, Table style #3)
 * The table shows: Name | Status | Date | Actions
 * Back button navigates to /service-attendance (per your choice B)
 */

export default function SearchView() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [status, setStatus] = useState(""); // matching membershipType
  const [date, setDate] = useState("");

  // Build results by joining mockServiceAttendance -> mockPeople
  const results = useMemo(() => {
    // join attendance rows with people
    const joined = mockServiceAttendance.map((r) => {
      const person = mockPeople.find((p) => p.id === r.personId);
      return {
        attendanceId: r.id,
        serviceId: r.serviceId,
        date: r.date,
        personId: r.personId,
        personName: person?.name ?? "Unknown",
        personStatus: person?.membershipType ?? "Unknown",
      };
    });

    return joined.filter((row) => {
      if (name && !row.personName.toLowerCase().includes(name.toLowerCase())) return false;
      if (status && row.personStatus !== status) return false;
      if (date && row.date !== date) return false;
      return true;
    });
  }, [name, status, date]);

  // get distinct statuses from mockPeople for filter dropdown/simple list
  const statuses = Array.from(new Set(mockPeople.map((p) => p.membershipType))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Search Attendance</h1>
          <p className="text-muted-foreground">Find attendees by name, status or date</p>
        </div>

        <Button variant="outline" size="icon" onClick={() => router.push("/service-attendance")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Type filters below and press Enter or let it auto-update</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border px-2 py-2"
              >
                <option value="">Any</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Matching attendance rows</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row) => (
                  <TableRow key={row.attendanceId}>
                    <TableCell className="font-medium">{row.personName}</TableCell>
                    <TableCell>{row.personStatus}</TableCell>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {/* navigate to the grouped session details */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const sessionId = `${row.serviceId}---${row.date}`;
                          router.push(`/service-attendance/${sessionId}`);
                        }}
                      >
                        Open session
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center p-6">
                      No results
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
