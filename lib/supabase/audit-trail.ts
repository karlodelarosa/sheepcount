import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditLogEntry = {
  id: string;
  organization_id: string;
  actor_user_id: string | null;
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id: string | null;
  metadata: {
    person_name?: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
  };
  created_at: string;
  actor?: {
    first_name: string;
    last_name: string;
  } | null;
};

export async function fetchAuditLogs(
  supabase: SupabaseClient,
  organizationId: string,
  limit = 100,
): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from("organization_audit_logs")
    .select(
      "id, organization_id, actor_user_id, action, entity_type, entity_id, metadata, created_at",
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }

  const rows = data ?? [];
  const actorIds = [
    ...new Set(
      rows
        .map(row => row.actor_user_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  ];

  const actorMap = new Map<string, { first_name: string; last_name: string }>();

  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", actorIds);

    for (const profile of profiles ?? []) {
      actorMap.set(profile.id, {
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
    }
  }

  return rows.map(row => ({
    id: row.id,
    organization_id: row.organization_id,
    actor_user_id: row.actor_user_id,
    action: row.action as AuditLogEntry["action"],
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    metadata: (row.metadata ?? {}) as AuditLogEntry["metadata"],
    created_at: row.created_at,
    actor: row.actor_user_id ? actorMap.get(row.actor_user_id) ?? null : null,
  }));
}
