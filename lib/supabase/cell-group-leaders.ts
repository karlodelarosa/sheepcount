import type { SupabaseClient } from "@supabase/supabase-js";

export type CellGroupLeaderCandidate = {
  personId: string;
  fullName: string;
  email: string;
  phone: string;
};

export type CellGroupLeadershipRosterEntry = {
  personId: string;
  fullName: string;
  email: string;
  approvalStatus: "approved";
  activeGroupCount: number;
  accountStatus: "none" | "active" | "inactive";
  accountKind: "existing" | "generated" | null;
  loginId: string | null;
};

export type CellGroupLeaderApprovalResult = {
  personId: string;
  fullName?: string;
  ok: boolean;
  status?: "approved" | "revoked";
  unchanged?: boolean;
  message?: string;
};

export async function fetchCellGroupLeadershipRoster(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CellGroupLeadershipRosterEntry[]> {
  const { data, error } = await supabase.rpc(
    "get_cell_group_leadership_roster",
    {
      p_organization_id: organizationId,
    },
  );
  if (error) throw error;
  return (data ?? []) as CellGroupLeadershipRosterEntry[];
}

export async function searchCellGroupLeaderCandidates(
  supabase: SupabaseClient,
  organizationId: string,
  query: string,
): Promise<CellGroupLeaderCandidate[]> {
  const { data, error } = await supabase.rpc(
    "search_cell_group_leader_candidates",
    {
      p_organization_id: organizationId,
      p_query: query.trim().slice(0, 100),
      p_limit: 50,
    },
  );
  if (error) throw error;
  return (data ?? []) as CellGroupLeaderCandidate[];
}

export async function setCellGroupLeaderApprovals(
  supabase: SupabaseClient,
  organizationId: string,
  personIds: string[],
  approved: boolean,
): Promise<CellGroupLeaderApprovalResult[]> {
  if (personIds.length === 0 || personIds.length > 100) {
    throw new Error("Choose between 1 and 100 people.");
  }
  const { data, error } = await supabase.rpc(
    "set_cell_group_leader_approvals",
    {
      p_person_ids: personIds,
      p_approved: approved,
      p_organization_id: organizationId,
    },
  );
  if (error) throw error;
  return (data ?? []) as CellGroupLeaderApprovalResult[];
}
