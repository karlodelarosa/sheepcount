"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, Users, Trash, Clock, X, UserPlus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ConfirmDeleteDialog } from "@/app/(protected)/work-ministry/_components/confirm-delete-dialog";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  buildSessionPath,
  fetchSessionDetail,
  parseSessionPath,
  type SessionDetail,
} from "@/lib/supabase/service-attendance";
import { useServiceAttendance } from "@/lib/service-attendance";
import { usePeople } from "@/lib/people";
import {
  getMembershipDisplayLabel,
  getPersonVisitDate,
} from "@/lib/membership-path";
import { SessionAttendanceBreakdown } from "../_components/session-attendance-breakdown";
import { AddAttendeesDialog } from "../_components/add-attendees-dialog";
import {
  EditSessionDetailsDialog,
  type EditSessionDetailsInput,
} from "../_components/edit-session-details-dialog";
import type { NewAttendanceAttendee } from "../_lib/attendance-workflow";
import {
  ATTENDANCE_STATUS_LABELS,
  attendeeMatchesStatusFilter,
  getAttendeeStatusBadgeClass,
  getAttendeeStatusRowAccent,
  type AttendanceStatusKey,
} from "../_lib/attendance-breakdown";
import { cn } from "@/lib/utils";

interface Props {
  attendanceId: string;
}

function formatArrivalTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function AttendanceDetailsView({ attendanceId }: Props) {
  const router = useRouter();
  const { tenant } = useTenant();
  const organizationId = getOrganizationId(tenant);
  const { removeAttendee, recordAttendance, updateSessionDetails, deleteSession, serviceTypes, isSaving } =
    useServiceAttendance();
  const { people, addPerson } = usePeople();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusKey | null>(
    null,
  );
  const addAttendeesInFlight = useRef(false);

  const parsed = parseSessionPath(attendanceId);

  useEffect(() => {
    if (!organizationId || !parsed) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let mounted = true;
    const supabase = createClient();

    void (async () => {
      try {
        const detail = await fetchSessionDetail(
          supabase,
          organizationId,
          parsed.serviceId,
          parsed.date,
        );
        if (!mounted) return;
        if (!detail) {
          setNotFound(true);
          setSession(null);
        } else {
          setSession(detail);
          setNotFound(false);
        }
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [organizationId, attendanceId, parsed]);

  const reloadSession = async () => {
    if (!organizationId || !parsed) return;
    const supabase = createClient();
    const detail = await fetchSessionDetail(
      supabase,
      organizationId,
      parsed.serviceId,
      parsed.date,
    );
    setSession(detail);
    setNotFound(!detail);
  };

  const handleRemovePerson = async (attendanceRowId: string) => {
    const ok = await removeAttendee(attendanceRowId);
    if (ok) await reloadSession();
  };

  const handleEditSessionDetails = async (input: EditSessionDetailsInput) => {
    if (!session) return false;

    const result = await updateSessionDetails({
      sessionId: session.sessionId,
      ...input,
    });
    if (!result) return false;

    router.replace(
      `/service-attendance/${buildSessionPath(result.serviceId, result.date)}`,
    );
    return true;
  };

  const handleDeleteSession = async () => {
    if (!session) return;

    const ok = await deleteSession(session.sessionId);
    if (!ok) return;

    setDeleteOpen(false);
    router.push("/service-attendance");
  };

  const handleAddAttendees = async (attendees: NewAttendanceAttendee[]) => {
    if (!session || !parsed || addAttendeesInFlight.current) return false;

    addAttendeesInFlight.current = true;
    try {
      const existingIds = new Set(session.attendees.map(a => a.personId));
      const resolvedAttendees: {
        personId: string;
        timeOfArrival: string | null;
      }[] = [];

      for (const attendee of attendees) {
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

          if (!existingIds.has(person.id)) {
            resolvedAttendees.push({
              personId: person.id,
              timeOfArrival: attendee.timeOfArrival,
            });
            existingIds.add(person.id);
          }
          continue;
        }

        if (attendee.personId && !existingIds.has(attendee.personId)) {
          resolvedAttendees.push({
            personId: attendee.personId,
            timeOfArrival: attendee.timeOfArrival,
          });
          existingIds.add(attendee.personId);
        }
      }

      if (resolvedAttendees.length === 0) return true;

      const sessionId = await recordAttendance({
        serviceId: parsed.serviceId,
        date: parsed.date,
        attendees: resolvedAttendees,
        successMessage: "Attendees added",
      });

      if (!sessionId) return false;

      await reloadSession();
      return true;
    } finally {
      addAttendeesInFlight.current = false;
    }
  };

  const peopleOptions = useMemo(
    () =>
      people.map((person) => ({
        id: person.id,
        name: person.name,
        householdName: person.householdName,
      })),
    [people],
  );

  const breakdownAttendees = useMemo(
    () =>
      (session?.attendees ?? []).map(person => {
        const directoryPerson = people.find(p => p.id === person.personId);
        return {
          personId: person.personId,
          attendanceId: person.attendanceId,
          membershipType: person.membershipType,
          firstAttendance: directoryPerson?.firstAttendance,
          joinDate: directoryPerson?.joinDate,
        };
      }),
    [session?.attendees, people],
  );

  const filteredAttendees = useMemo(() => {
    if (!session) return [];
    return session.attendees.filter(person => {
      const meta = breakdownAttendees.find(a => a.attendanceId === person.attendanceId);
      if (!meta) return true;
      return attendeeMatchesStatusFilter(meta, statusFilter);
    });
  }, [session, breakdownAttendees, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push("/service-attendance")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Card className="border-destructive/40">
          <CardContent className="p-6 text-center text-sm text-destructive">
            Attendance session not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const evangelismCount = session.attendees.filter(
    (p) => p.membershipType === "For Evangelism",
  ).length;

  const isSunday = session.serviceCategory === "sunday";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/service-attendance")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{session.serviceType}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(session.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {formatArrivalTime(session.serviceStartTime)} start
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Session options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4" />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {session.attendees.length > 0 && (
        <SessionAttendanceBreakdown
          attendees={breakdownAttendees}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      )}

      <Card
        className={
          isSunday
            ? "border-violet-200/60 dark:border-violet-800/40 bg-violet-50/20 dark:bg-violet-950/10"
            : "border-blue-200/50 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-950/10"
        }
      >
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Attendance
            </CardTitle>
            <CardDescription className="text-xs">
              {statusFilter
                ? `Showing ${ATTENDANCE_STATUS_LABELS[statusFilter].toLowerCase()} only`
                : "Recorded attendees"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <AddAttendeesDialog
              serviceType={session.serviceType}
              date={session.date}
              serviceStartTime={session.serviceStartTime}
              existingAttendeeIds={session.attendees.map((a) => a.personId)}
              people={peopleOptions}
              isSaving={isSaving}
              onAddAttendees={handleAddAttendees}
            >
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </Button>
            </AddAttendeesDialog>
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Users className="w-3 h-3" />
              {statusFilter
                ? `${filteredAttendees.length} / ${session.attendees.length}`
                : session.attendees.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {evangelismCount > 0 && (
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
              {evangelismCount} marked for evangelism follow-up
            </div>
          )}

          {statusFilter && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-xs">
              <span>
                Filtered to{" "}
                <span className="font-medium">
                  {ATTENDANCE_STATUS_LABELS[statusFilter]}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1"
                onClick={() => setStatusFilter(null)}
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            {session.attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No attendees recorded.
              </p>
            ) : filteredAttendees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No attendees match this filter.
              </p>
            ) : (
              filteredAttendees.map(person => {
                const attendeeMeta =
                  breakdownAttendees.find(
                    a => a.attendanceId === person.attendanceId,
                  ) ?? person;
                const visitDate = getPersonVisitDate(
                  people.find(p => p.id === person.personId) ?? {},
                );
                const statusLabel = getMembershipDisplayLabel(
                  person.membershipType,
                  visitDate,
                );

                return (
                <div
                  key={person.attendanceId}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/60 text-sm border-l-[3px]",
                    getAttendeeStatusRowAccent(attendeeMeta),
                  )}
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs text-white shrink-0 ${
                      isSunday ? "bg-violet-500" : "bg-blue-500"
                    }`}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/people/${person.personId}`}
                      className="truncate block font-medium hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                    >
                      {person.name}
                    </Link>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {person.householdName}
                      {person.timeOfArrival && (
                        <>
                          {" · "}
                          <Clock className="inline w-2.5 h-2.5 mr-0.5" />
                          {formatArrivalTime(person.timeOfArrival)}
                        </>
                      )}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] shrink-0 border",
                      getAttendeeStatusBadgeClass(attendeeMeta),
                    )}
                  >
                    {statusLabel}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    disabled={isSaving}
                    onClick={() => handleRemovePerson(person.attendanceId)}
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </Button>
                </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete attendance session?"
        description={`This will permanently remove ${session.serviceType} on ${new Date(session.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })} and all ${session.attendees.length} recorded attendee${session.attendees.length === 1 ? "" : "s"}. This cannot be undone.`}
        confirmLabel="Delete session"
        onConfirm={handleDeleteSession}
        isLoading={isSaving}
      />

      <EditSessionDetailsDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        serviceId={session.serviceId}
        date={session.date}
        serviceStartTime={session.serviceStartTime}
        serviceTypes={serviceTypes}
        isSaving={isSaving}
        onSave={handleEditSessionDetails}
      />
    </div>
  );
}
