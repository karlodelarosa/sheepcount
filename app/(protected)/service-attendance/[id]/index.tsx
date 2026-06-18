"use client";

import { useEffect, useState } from "react";
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
import { Calendar, ArrowLeft, Users, Trash } from "lucide-react";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  fetchSessionDetail,
  parseSessionPath,
  type SessionDetail,
} from "@/lib/supabase/service-attendance";
import { useServiceAttendance } from "@/lib/service-attendance";
import { usePeople } from "@/lib/people";
import { getMembershipDisplayLabel } from "@/lib/membership-path";

interface Props {
  attendanceId: string;
}

export function AttendanceDetailsView({ attendanceId }: Props) {
  const router = useRouter();
  const { tenant } = useTenant();
  const organizationId = getOrganizationId(tenant);
  const { removeAttendee, isSaving } = useServiceAttendance();
  const { people } = usePeople();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push("/service-attendance")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{session.serviceType}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(session.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

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
              Recorded attendees
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-[10px]">
            <Users className="w-3 h-3" />
            {session.attendees.length}
          </Badge>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {evangelismCount > 0 && (
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
              {evangelismCount} marked for evangelism follow-up
            </div>
          )}

          <div className="space-y-1.5">
            {session.attendees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No attendees recorded.
              </p>
            ) : (
              session.attendees.map((person) => (
                <div
                  key={person.attendanceId}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/60 text-sm"
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs text-white shrink-0 ${
                      isSunday ? "bg-violet-500" : "bg-blue-500"
                    }`}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {person.householdName}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {getMembershipDisplayLabel(
                      person.membershipType,
                      people.find(p => p.id === person.personId)?.joinDate,
                    )}
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
