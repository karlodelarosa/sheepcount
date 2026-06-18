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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { usePeople } from "@/lib/people";
import { useServiceAttendance } from "@/lib/service-attendance";
import { buildSessionPath } from "@/lib/supabase/service-attendance";
import { getMembershipDisplayLabel } from "@/lib/membership-path";

export default function SearchView() {
  const router = useRouter();
  const { people, hydrated: peopleHydrated } = usePeople();
  const { attendanceRows, hydrated } = useServiceAttendance();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const results = useMemo(() => {
    const joined = attendanceRows.map((r) => {
      const person = people.find((p) => p.id === r.personId);
      return {
        attendanceId: r.id,
        serviceId: r.serviceId,
        serviceType: r.serviceType,
        date: r.date,
        personId: r.personId,
        personName: person?.name ?? "Unknown",
        personStatus: person
          ? getMembershipDisplayLabel(person.membershipType, person.joinDate)
          : "Unknown",
      };
    });

    return joined.filter((row) => {
      if (name && !row.personName.toLowerCase().includes(name.toLowerCase())) {
        return false;
      }
      if (status && row.personStatus !== status) return false;
      if (date && row.date !== date) return false;
      return true;
    });
  }, [attendanceRows, people, name, status, date]);

  const statuses = Array.from(
    new Set(
      people.map(p =>
        getMembershipDisplayLabel(p.membershipType, p.joinDate),
      ),
    ),
  ).filter(Boolean);

  const loading = !hydrated || !peopleHydrated;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Search Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Find attendees by name, status, or date
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-card/50">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">Filters</CardTitle>
          <CardDescription className="text-xs">
            Results update as you type
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                className="h-8 text-sm"
                placeholder="Search by name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-8 rounded-md border px-2 text-sm bg-background"
              >
                <option value="">Any</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                className="h-8 text-sm"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Results</CardTitle>
            <CardDescription className="text-xs">
              Matching attendance rows
            </CardDescription>
          </div>
          {!loading && (
            <Badge variant="outline" className="text-[10px]">
              {results.length}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Service</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row) => (
                    <TableRow key={row.attendanceId}>
                      <TableCell className="text-sm font-medium py-2">
                        {row.personName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2">
                        {row.serviceType}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        {row.personStatus}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        {new Date(row.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            router.push(
                              `/service-attendance/${buildSessionPath(row.serviceId, row.date)}`,
                            );
                          }}
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {results.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No results
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
