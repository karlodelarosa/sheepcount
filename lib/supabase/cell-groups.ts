import type { SupabaseClient } from "@supabase/supabase-js";
import { assertCellLeaderTrainingComplete } from "@/lib/supabase/training";

export type CellGroupStatus = "active" | "graduated" | "multiplied";

export type CellGroup = {
  id: string;
  name: string;
  description: string;
  leaderPersonId: string | null;
  status: CellGroupStatus;
  parentCellGroupId: string | null;
};

export type CellGroupMember = {
  id: string;
  cellGroupId: string;
  personId: string;
  role: "Leader" | "Member";
  joinedDate: string;
};

type DbCellGroup = {
  id: string;
  name: string;
  description: string;
  leader_person_id: string | null;
  status: CellGroupStatus;
  parent_cell_group_id: string | null;
};

type DbCellGroupMember = {
  id: string;
  cell_group_id: string;
  person_id: string;
  role: "Leader" | "Member";
  joined_date: string;
};

function toCellGroup(row: DbCellGroup): CellGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    leaderPersonId: row.leader_person_id,
    status: row.status,
    parentCellGroupId: row.parent_cell_group_id,
  };
}

function toCellGroupMember(row: DbCellGroupMember): CellGroupMember {
  return {
    id: row.id,
    cellGroupId: row.cell_group_id,
    personId: row.person_id,
    role: row.role,
    joinedDate: row.joined_date,
  };
}

export async function fetchCellGroups(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CellGroup[]> {
  const { data, error } = await supabase
    .from("cell_groups")
    .select("id, name, description, leader_person_id, status, parent_cell_group_id")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw error;
  return (data as DbCellGroup[]).map(toCellGroup);
}

export async function fetchCellGroupMembers(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CellGroupMember[]> {
  const { data, error } = await supabase
    .from("cell_group_members")
    .select(
      "id, cell_group_id, person_id, role, joined_date, cell_groups!inner(organization_id)",
    )
    .eq("cell_groups.organization_id", organizationId);

  if (error) throw error;
  return (data as DbCellGroupMember[]).map(toCellGroupMember);
}

export type CreateCellGroupInput = {
  name: string;
  description?: string;
  leaderPersonId?: string;
};

export async function createCellGroup(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateCellGroupInput,
): Promise<CellGroup> {
  const { data, error } = await supabase
    .from("cell_groups")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      leader_person_id: input.leaderPersonId ?? null,
    })
    .select("id, name, description, leader_person_id, status, parent_cell_group_id")
    .single();

  if (error) throw error;
  return toCellGroup(data as DbCellGroup);
}

export async function addCellGroupMember(
  supabase: SupabaseClient,
  cellGroupId: string,
  personId: string,
  role: "Leader" | "Member" = "Member",
  organizationId?: string,
): Promise<CellGroupMember> {
  const { data: existing, error: existingError } = await supabase
    .from("cell_group_members")
    .select("id, cell_group_id, person_id, role, joined_date")
    .eq("cell_group_id", cellGroupId)
    .eq("person_id", personId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const row = existing as DbCellGroupMember;
    if (row.role !== role) {
      if (role === "Leader") {
        let orgId = organizationId;
        if (!orgId) {
          const { data: group, error: groupError } = await supabase
            .from("cell_groups")
            .select("organization_id")
            .eq("id", cellGroupId)
            .single();
          if (groupError) throw groupError;
          orgId = group.organization_id as string;
        }
        await assertCellLeaderTrainingComplete(supabase, orgId, personId);
      }

      const { data, error } = await supabase
        .from("cell_group_members")
        .update({ role })
        .eq("id", row.id)
        .select("id, cell_group_id, person_id, role, joined_date")
        .single();

      if (error) throw error;
      return toCellGroupMember(data as DbCellGroupMember);
    }

    return toCellGroupMember(row);
  }

  if (role === "Leader") {
    let orgId = organizationId;
    if (!orgId) {
      const { data: group, error: groupError } = await supabase
        .from("cell_groups")
        .select("organization_id")
        .eq("id", cellGroupId)
        .single();
      if (groupError) throw groupError;
      orgId = group.organization_id as string;
    }
    await assertCellLeaderTrainingComplete(supabase, orgId, personId);
  }

  const { data, error } = await supabase
    .from("cell_group_members")
    .insert({
      cell_group_id: cellGroupId,
      person_id: personId,
      role,
    })
    .select("id, cell_group_id, person_id, role, joined_date")
    .single();

  if (error) throw error;
  return toCellGroupMember(data as DbCellGroupMember);
}

export async function updateCellGroupLeader(
  supabase: SupabaseClient,
  organizationId: string,
  cellGroupId: string,
  leaderPersonId: string,
): Promise<CellGroup> {
  await assertCellLeaderTrainingComplete(
    supabase,
    organizationId,
    leaderPersonId,
  );

  await addCellGroupMember(
    supabase,
    cellGroupId,
    leaderPersonId,
    "Leader",
    organizationId,
  );

  const { data, error } = await supabase
    .from("cell_groups")
    .update({
      leader_person_id: leaderPersonId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cellGroupId)
    .eq("organization_id", organizationId)
    .select(
      "id, name, description, leader_person_id, status, parent_cell_group_id",
    )
    .single();

  if (error) throw error;
  return toCellGroup(data as DbCellGroup);
}

export async function removeCellGroupMember(
  supabase: SupabaseClient,
  membershipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("cell_group_members")
    .delete()
    .eq("id", membershipId);

  if (error) throw error;
}
