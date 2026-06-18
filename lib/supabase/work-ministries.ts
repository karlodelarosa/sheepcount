import type { SupabaseClient } from "@supabase/supabase-js";

export type WorkMinistry = {
  id: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
};

export type WorkMinistryMember = {
  id: string;
  ministryId: string;
  personId: string;
  role: string;
  assignedDate: string;
};

type DbWorkMinistry = {
  id: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_default: boolean;
};

type DbWorkMinistryMember = {
  id: string;
  work_ministry_id: string;
  person_id: string;
  role: string;
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
  };
}

function toWorkMinistryMember(row: DbWorkMinistryMember): WorkMinistryMember {
  return {
    id: row.id,
    ministryId: row.work_ministry_id,
    personId: row.person_id,
    role: row.role,
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
    .select("id, name, description, color, sort_order, is_default")
    .eq("organization_id", organizationId)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbWorkMinistry[]).map(toWorkMinistry);
}

export async function fetchWorkMinistryMembers(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<WorkMinistryMember[]> {
  const { data, error } = await supabase
    .from("work_ministry_members")
    .select(
      "id, work_ministry_id, person_id, role, assigned_date, work_ministries!inner(organization_id)",
    )
    .eq("work_ministries.organization_id", organizationId);

  if (error) throw error;
  return (data as DbWorkMinistryMember[]).map(toWorkMinistryMember);
}

export async function addWorkMinistryMember(
  supabase: SupabaseClient,
  ministryId: string,
  personId: string,
  role: string,
): Promise<WorkMinistryMember> {
  const { data, error } = await supabase
    .from("work_ministry_members")
    .insert({
      work_ministry_id: ministryId,
      person_id: personId,
      role,
    })
    .select("id, work_ministry_id, person_id, role, assigned_date")
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
