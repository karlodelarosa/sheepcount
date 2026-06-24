import type { SupabaseClient } from "@supabase/supabase-js";

export type LifeGroupCategory = "Children" | "Youth" | "Adults";

export type LifeGroup = {
  id: string;
  name: string;
  description: string;
  schedule: string;
  category: LifeGroupCategory;
  color: string;
  sortOrder: number;
  isDefault: boolean;
};

export type LifeGroupMember = {
  id: string;
  lifeGroupId: string;
  personId: string;
  joinedDate: string;
};

type DbLifeGroup = {
  id: string;
  name: string;
  description: string;
  schedule: string;
  category: LifeGroupCategory;
  color: string;
  sort_order: number;
  is_default: boolean;
};

type DbLifeGroupMember = {
  id: string;
  life_group_id: string;
  person_id: string;
  joined_date: string;
};

function toLifeGroup(row: DbLifeGroup): LifeGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    schedule: row.schedule ?? "",
    category: row.category,
    color: row.color,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
  };
}

const LIFE_GROUP_SELECT =
  "id, name, description, schedule, category, color, sort_order, is_default";

function toLifeGroupMember(row: DbLifeGroupMember): LifeGroupMember {
  return {
    id: row.id,
    lifeGroupId: row.life_group_id,
    personId: row.person_id,
    joinedDate: row.joined_date,
  };
}

export async function ensureDefaultLifeGroups(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const { error } = await supabase.rpc("seed_default_life_groups", {
    org_id: organizationId,
  });
  if (error) throw error;
}

export async function fetchLifeGroups(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<LifeGroup[]> {
  await ensureDefaultLifeGroups(supabase, organizationId);

  const { data, error } = await supabase
    .from("life_groups")
    .select(LIFE_GROUP_SELECT)
    .eq("organization_id", organizationId)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbLifeGroup[]).map(toLifeGroup);
}

export async function fetchLifeGroupMembers(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<LifeGroupMember[]> {
  const { data, error } = await supabase
    .from("life_group_members")
    .select(
      "id, life_group_id, person_id, joined_date, life_groups!inner(organization_id)",
    )
    .eq("life_groups.organization_id", organizationId);

  if (error) throw error;

  return (data as DbLifeGroupMember[]).map(toLifeGroupMember);
}

export type CreateLifeGroupInput = {
  name: string;
  description?: string;
  category: LifeGroupCategory;
  color?: string;
};

export async function createLifeGroup(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateLifeGroupInput,
): Promise<LifeGroup> {
  const { data, error } = await supabase
    .from("life_groups")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      category: input.category,
      color: input.color ?? "purple",
    })
    .select(LIFE_GROUP_SELECT)
    .single();

  if (error) throw error;
  return toLifeGroup(data as DbLifeGroup);
}

export type UpdateLifeGroupInput = {
  name?: string;
  description?: string;
  schedule?: string;
};

export async function updateLifeGroup(
  supabase: SupabaseClient,
  lifeGroupId: string,
  input: UpdateLifeGroupInput,
): Promise<LifeGroup> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.description !== undefined)
    updates.description = input.description.trim();
  if (input.schedule !== undefined) updates.schedule = input.schedule.trim();

  const { data, error } = await supabase
    .from("life_groups")
    .update(updates)
    .eq("id", lifeGroupId)
    .select(LIFE_GROUP_SELECT)
    .single();

  if (error) throw error;
  return toLifeGroup(data as DbLifeGroup);
}

export async function addLifeGroupMember(
  supabase: SupabaseClient,
  lifeGroupId: string,
  personId: string,
): Promise<LifeGroupMember> {
  const { data, error } = await supabase
    .from("life_group_members")
    .insert({
      life_group_id: lifeGroupId,
      person_id: personId,
    })
    .select("id, life_group_id, person_id, joined_date")
    .single();

  if (error) throw error;
  return toLifeGroupMember(data as DbLifeGroupMember);
}

export async function removeLifeGroupMember(
  supabase: SupabaseClient,
  membershipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("life_group_members")
    .delete()
    .eq("id", membershipId);

  if (error) throw error;
}
