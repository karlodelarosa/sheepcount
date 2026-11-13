"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  KeyRound,
  MessageCircleHeart,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/app/providers/tenant-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasFeature } from "@/lib/subscription/entitlements";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { createClient } from "@/lib/supabase/client";

type AccessRequest = {
  id: string;
  status: string;
  requested_at: string;
  people:
    | { first_name: string; last_name: string; email: string }
    | { first_name: string; last_name: string; email: string }[]
    | null;
};

type Gathering = {
  id: string;
  title: string;
  starts_at: string;
  status: string;
  checkin_code: string | null;
  attendance_session_id: string | null;
};

type Prayer = {
  id: string;
  title: string;
  category: string;
  is_answered: boolean;
  created_at: string;
  people:
    | { first_name: string; last_name: string }
    | { first_name: string; last_name: string }[]
    | null;
};

const one = <T,>(value: T | T[] | null): T | null =>
  Array.isArray(value) ? (value[0] ?? null) : value;

export function CirclesManagement({ groupId }: { groupId: string }) {
  const { tenant } = useTenant();
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const supabase = useMemo(() => createClient(), []);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const enabled =
    hasFeature(entitlements, "circles_access") &&
    tenant?.tenant.status === "active";
  const isAdmin = tenant?.profile.role === "admin";
  const circlesUrl =
    process.env.NEXT_PUBLIC_CIRCLES_URL || "https://circles.elgchurch.com";

  const load = useCallback(async () => {
    if (!enabled || !isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [accessResult, gatheringResult, prayerResult] = await Promise.all([
      supabase
        .from("circle_access_requests")
        .select(
          "id, status, requested_at, people!circle_access_requests_person_id_fkey(first_name, last_name, email)",
        )
        .eq("cell_group_id", groupId)
        .in("status", ["pending", "approved"])
        .order("requested_at"),
      supabase
        .from("circle_gatherings")
        .select(
          "id, title, starts_at, status, checkin_code, attendance_session_id",
        )
        .eq("cell_group_id", groupId)
        .order("starts_at", { ascending: false })
        .limit(8),
      supabase
        .from("circle_prayer_requests")
        .select(
          "id, title, category, is_answered, created_at, people!circle_prayer_requests_person_id_fkey(first_name, last_name)",
        )
        .eq("cell_group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
    const firstError =
      accessResult.error ?? gatheringResult.error ?? prayerResult.error;
    if (firstError)
      toast.error("Could not load Circles administration", {
        description: firstError.message,
      });
    setRequests((accessResult.data ?? []) as AccessRequest[]);
    setGatherings((gatheringResult.data ?? []) as Gathering[]);
    setPrayers((prayerResult.data ?? []) as Prayer[]);
    setLoading(false);
  }, [enabled, groupId, isAdmin, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (request: AccessRequest) => {
    const person = one(request.people);
    if (!person?.email) {
      toast.error("Add an email to this person first.");
      return;
    }
    const { data: approvedEmail, error } = await supabase.rpc(
      "approve_circle_access",
      { p_request_id: request.id },
    );
    if (error) {
      toast.error("Access could not be approved", {
        description: error.message,
      });
      return;
    }
    const email = (approvedEmail as string) || person.email;
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: circlesUrl, shouldCreateUser: true },
    });
    if (emailError) {
      toast.error("Approved, but the magic link was not sent", {
        description: emailError.message,
      });
      return;
    }
    toast.success(`Circles access approved for ${person.first_name}`, {
      description: `A secure sign-in link was sent to ${email}.`,
    });
    await load();
  };

  if (entitlementsLoading) return null;
  if (!enabled)
    return (
      <Card className="mt-8 border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle>Circles is a Pro feature</CardTitle>
          <CardDescription>
            This organization is inactive or does not currently have the Circles
            entitlement. Upgrade to enable member access, gatherings, guest
            check-in, and the private prayer wall.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  if (!isAdmin) return null;

  return (
    <section className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-600" /> Circles
            administration
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Shared with the Circles member app through the same database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" asChild>
            <a href={circlesUrl} target="_blank" rel="noreferrer">
              Open Circles <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" /> Access requests
            </CardTitle>
            <CardDescription>
              Leaders request; organization admins approve.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.length ? (
              requests.map(request => {
                const person = one(request.people);
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {person
                          ? `${person.first_name} ${person.last_name}`
                          : "Unknown person"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {person?.email || "Email needed"}
                      </p>
                    </div>
                    {request.status === "pending" ? (
                      <Button size="sm" onClick={() => void approve(request)}>
                        Approve
                      </Button>
                    ) : (
                      <Badge variant="secondary">Link sent</Badge>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No pending access requests.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" /> Gatherings
            </CardTitle>
            <CardDescription>
              Future plans become attendance only when check-in opens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gatherings.length ? (
              gatherings.map(gathering => (
                <div
                  key={gathering.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{gathering.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(gathering.starts_at))}
                    </p>
                  </div>
                  <Badge
                    variant={
                      gathering.attendance_session_id ? "default" : "secondary"
                    }
                  >
                    {gathering.attendance_session_id
                      ? "Attendance linked"
                      : gathering.checkin_code
                        ? "Check-in open"
                        : gathering.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No Circles gatherings yet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircleHeart className="h-4 w-4" /> Prayer care
            </CardTitle>
            <CardDescription>
              Organization admins can provide safeguarding and pastoral
              oversight.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {prayers.length ? (
              prayers.map(prayer => {
                const person = one(prayer.people);
                return (
                  <div key={prayer.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{prayer.title}</p>
                      {prayer.is_answered && (
                        <Badge variant="secondary">Answered</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {person
                        ? `${person.first_name} ${person.last_name}`
                        : "Circle member"}{" "}
                      · {prayer.category}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No prayer requests shared.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
