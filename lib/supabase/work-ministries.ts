import type { SupabaseClient } from "@supabase/supabase-js";

export type WorkMinistry = {
  id: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  headPersonId: string | null;
};

export type WorkMinistryTeam = {
  id: string;
  ministryId: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type WorkMinistryTeamRole = {
  id: string;
  teamId: string;
  name: string;
  sortOrder: number;
};

export type WorkMinistryMember = {
  id: string;
  ministryId: string;
  personId: string;
  teamId: string | null;
  role: string;
  serviceRole: string;
  assignedDate: string;
};

type DbWorkMinistry = {
  id: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_default: boolean;
  head_person_id: string | null;
};

type DbWorkMinistryTeam = {
  id: string;
  work_ministry_id: string;
  name: string;
  description: string;
  sort_order: number;
};

type DbWorkMinistryTeamRole = {
  id: string;
  work_ministry_team_id: string;
  name: string;
  sort_order: number;
};

type DbWorkMinistryMember = {
  id: string;
  work_ministry_id: string;
  person_id: string;
  team_id: string | null;
  role: string;
  service_role: string;
  assigned_date: string;
};

function toWorkMinistry(row: DbWorkMinistry): WorkMinistry {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
    headPersonId: row.head_person_id,
  };
}

function toWorkMinistryTeam(row: DbWorkMinistryTeam): WorkMinistryTeam {
  return {
    id: row.id,
    ministryId: row.work_ministry_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function toWorkMinistryTeamRole(row: DbWorkMinistryTeamRole): WorkMinistryTeamRole {
  return {
    id: row.id,
    teamId: row.work_ministry_team_id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

function toWorkMinistryMember(row: DbWorkMinistryMember): WorkMinistryMember {
  return {
    id: row.id,
    ministryId: row.work_ministry_id,
    personId: row.person_id,
    teamId: row.team_id,
    role: row.role,
    serviceRole: row.service_role,
    assignedDate: row.assigned_date,
  };
}

export async function ensureDefaultWorkMinistries(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const { error } = await supabase.rpc("seed_default_work_ministries", {
    org_id: organizationId,
  });
  if (error) throw error;
}

export async function fetchWorkMinistries(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<WorkMinistry[]> {
  await ensureDefaultWorkMinistries(supabase, organizationId);

  const { data, error } = await supabase
    .from("work_ministries")
    .select("id, name, description, color, sort_order, is_default, head_person_id")
    .eq("organization_id", organizationId)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbWorkMinistry[]).map(toWorkMinistry);
}

export async function fetchWorkMinistryTeams(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<WorkMinistryTeam[]> {
  const { data, error } = await supabase
    .from("work_ministry_teams")
    .select(
      "id, work_ministry_id, name, description, sort_order, work_ministries!inner(organization_id)",
    )
    .eq("work_ministries.organization_id", organizationId)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbWorkMinistryTeam[]).map(toWorkMinistryTeam);
}

export async function fetchWorkMinistryTeamRoles(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<WorkMinistryTeamRole[]> {
  const { data, error } = await supabase
    .from("work_ministry_team_roles")
    .select(
      "id, work_ministry_team_id, name, sort_order, work_ministry_teams!inner(work_ministries!inner(organization_id))",
    )
    .eq("work_ministry_teams.work_ministries.organization_id", organizationId)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbWorkMinistryTeamRole[]).map(toWorkMinistryTeamRole);
}

export async function fetchWorkMinistryMembers(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<WorkMinistryMember[]> {
  const { data, error } = await supabase
    .from("work_ministry_members")
    .select(
      "id, work_ministry_id, person_id, team_id, role, service_role, assigned_date, work_ministries!inner(organization_id)",
    )
    .eq("work_ministries.organization_id", organizationId);

  if (error) throw error;
  return (data as DbWorkMinistryMember[]).map(toWorkMinistryMember);
}

export type CreateWorkMinistryInput = {
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
};

export type CreateWorkMinistryTeamInput = {
  name: string;
  description?: string;
  sortOrder?: number;
};

export async function createWorkMinistry(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateWorkMinistryInput,
): Promise<WorkMinistry> {
  const { data, error } = await supabase
    .from("work_ministries")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      color: input.color ?? "purple",
      sort_order: input.sortOrder ?? 0,
    })
    .select("id, name, description, color, sort_order, is_default, head_person_id")
    .single();

  if (error) throw error;
  return toWorkMinistry(data as DbWorkMinistry);
}

export async function deleteWorkMinistry(
  supabase: SupabaseClient,
  ministryId: string,
): Promise<void> {
  const { error } = await supabase
    .from("work_ministries")
    .delete()
    .eq("id", ministryId);

  if (error) throw error;
}

export async function updateWorkMinistry(
  supabase: SupabaseClient,
  ministryId: string,
  input: { headPersonId?: string | null },
): Promise<WorkMinistry> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.headPersonId !== undefined) {
    updates.head_person_id = input.headPersonId;
  }

  const { data, error } = await supabase
    .from("work_ministries")
    .update(updates)
    .eq("id", ministryId)
    .select("id, name, description, color, sort_order, is_default, head_person_id")
    .single();

  if (error) throw error;
  return toWorkMinistry(data as DbWorkMinistry);
}

export async function createWorkMinistryTeam(
  supabase: SupabaseClient,
  ministryId: string,
  input: CreateWorkMinistryTeamInput,
): Promise<WorkMinistryTeam> {
  const { data, error } = await supabase
    .from("work_ministry_teams")
    .insert({
      work_ministry_id: ministryId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      sort_order: input.sortOrder ?? 0,
    })
    .select("id, work_ministry_id, name, description, sort_order")
    .single();

  if (error) throw error;
  return toWorkMinistryTeam(data as DbWorkMinistryTeam);
}

export async function updateWorkMinistryTeam(
  supabase: SupabaseClient,
  teamId: string,
  input: Partial<CreateWorkMinistryTeamInput>,
): Promise<WorkMinistryTeam> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;

  const { data, error } = await supabase
    .from("work_ministry_teams")
    .update(updates)
    .eq("id", teamId)
    .select("id, work_ministry_id, name, description, sort_order")
    .single();

  if (error) throw error;
  return toWorkMinistryTeam(data as DbWorkMinistryTeam);
}

export async function deleteWorkMinistryTeam(
  supabase: SupabaseClient,
  teamId: string,
): Promise<void> {
  const { error } = await supabase
    .from("work_ministry_teams")
    .delete()
    .eq("id", teamId);

  if (error) throw error;
}

export async function addWorkMinistryTeamRole(
  supabase: SupabaseClient,
  teamId: string,
  name: string,
  sortOrder = 0,
): Promise<WorkMinistryTeamRole> {
  const { data, error } = await supabase
    .from("work_ministry_team_roles")
    .insert({
      work_ministry_team_id: teamId,
      name: name.trim(),
      sort_order: sortOrder,
    })
    .select("id, work_ministry_team_id, name, sort_order")
    .single();

  if (error) throw error;
  return toWorkMinistryTeamRole(data as DbWorkMinistryTeamRole);
}

export async function removeWorkMinistryTeamRole(
  supabase: SupabaseClient,
  roleId: string,
): Promise<void> {
  const { error } = await supabase
    .from("work_ministry_team_roles")
    .delete()
    .eq("id", roleId);

  if (error) throw error;
}

export type AddWorkMinistryMemberInput = {
  ministryId: string;
  personId: string;
  role: string;
  teamId?: string | null;
  serviceRole?: string;
};

export async function addWorkMinistryMember(
  supabase: SupabaseClient,
  ministryId: string,
  personId: string,
  role: string,
  options?: { teamId?: string | null; serviceRole?: string },
): Promise<WorkMinistryMember> {
  const { data, error } = await supabase
    .from("work_ministry_members")
    .insert({
      work_ministry_id: ministryId,
      person_id: personId,
      role,
      team_id: options?.teamId ?? null,
      service_role: options?.serviceRole?.trim() ?? "",
    })
    .select(
      "id, work_ministry_id, person_id, team_id, role, service_role, assigned_date",
    )
    .single();

  if (error) throw error;
  return toWorkMinistryMember(data as DbWorkMinistryMember);
}

export async function updateWorkMinistryMember(
  supabase: SupabaseClient,
  membershipId: string,
  updates: {
    role?: string;
    teamId?: string | null;
    serviceRole?: string;
  },
): Promise<WorkMinistryMember> {
  const payload: Record<string, unknown> = {};
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.teamId !== undefined) payload.team_id = updates.teamId;
  if (updates.serviceRole !== undefined) payload.service_role = updates.serviceRole.trim();

  const { data, error } = await supabase
    .from("work_ministry_members")
    .update(payload)
    .eq("id", membershipId)
    .select(
      "id, work_ministry_id, person_id, team_id, role, service_role, assigned_date",
    )
    .single();

  if (error) throw error;
  return toWorkMinistryMember(data as DbWorkMinistryMember);
}

export async function removeWorkMinistryMember(
  supabase: SupabaseClient,
  membershipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("work_ministry_members")
    .delete()
    .eq("id", membershipId);

  if (error) throw error;
}
