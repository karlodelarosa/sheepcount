"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ScrollText, Search } from "lucide-react";
import { useTenant } from "@/app/providers/tenant-provider";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { hasFeature } from "@/lib/subscription/entitlements";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  fetchAuditLogs,
  type AuditLogEntry,
} from "@/lib/supabase/audit-trail";

function formatActor(entry: AuditLogEntry) {
  if (!entry.actor) {
    return "System";
  }

  return `${entry.actor.first_name} ${entry.actor.last_name}`.trim() || "Unknown";
}

function formatAction(action: AuditLogEntry["action"]) {
  switch (action) {
    case "create":
      return "Created";
    case "update":
      return "Updated";
    case "delete":
      return "Deleted";
    default:
      return action;
  }
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function formatChanges(entry: AuditLogEntry) {
  const changes = entry.metadata.changes;
  if (!changes || Object.keys(changes).length === 0) {
    return "—";
  }

  return Object.entries(changes)
    .map(([field, change]) => `${field}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`)
    .join("; ");
}

export function AuditTrailView() {
  const { tenant } = useTenant();
  const { entitlements } = useEntitlements();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const auditEnabled = hasFeature(
    { features: entitlements.features },
    "audit_trail",
  );

  useEffect(() => {
    if (!organizationId || !auditEnabled) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAuditLogs(supabase, organizationId);
        if (mounted) {
          setLogs(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [auditEnabled, organizationId, supabase]);

  const filteredLogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return logs;

    return logs.filter(entry => {
      const personName = entry.metadata.person_name?.toLowerCase() ?? "";
      const actorName = formatActor(entry).toLowerCase();
      const action = entry.action.toLowerCase();
      return (
        personName.includes(needle) ||
        actorName.includes(needle) ||
        action.includes(needle)
      );
    });
  }, [logs, query]);

  if (!auditEnabled) {
    return (
      <div className="space-y-4">
        <h1>Audit Trail</h1>
        <Card>
          <CardHeader>
            <CardTitle>Pro feature</CardTitle>
            <CardDescription>
              People change history is available on the Pro plan.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h1>Audit Trail</h1>
          </div>
          <p className="text-muted-foreground">
            Who changed which person record in your organization
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search person or actor..."
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>People changes</CardTitle>
          <CardDescription>
            Create, update, and delete actions on person records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading audit history...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No audit entries yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatTimestamp(entry.created_at)}
                    </TableCell>
                    <TableCell>{formatActor(entry)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatAction(entry.action)}</Badge>
                    </TableCell>
                    <TableCell>
                      {entry.entity_id && entry.action !== "delete" ? (
                        <Button variant="link" className="h-auto p-0" asChild>
                          <Link href={`/people/${entry.entity_id}`}>
                            {entry.metadata.person_name || "Unknown person"}
                          </Link>
                        </Button>
                      ) : (
                        entry.metadata.person_name || "Unknown person"
                      )}
                    </TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">
                      {formatChanges(entry)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
