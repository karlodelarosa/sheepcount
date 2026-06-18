import type { SupabaseClient } from "@supabase/supabase-js";
import type { Household } from "@/lib/people";

type DbHousehold = {
  id: string;
  organization_id: string;
  name: string;
  address: string | null;
  created_at: string;
  updated_at: string;
};

function toHousehold(row: DbHousehold): Household {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? "",
    createdDate: row.created_at.split("T")[0],
  };
}

export type CreateHouseholdInput = {
  name: string;
  address?: string;
};

export type UpdateHouseholdInput = Partial<CreateHouseholdInput>;

export async function createHousehold(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateHouseholdInput,
): Promise<Household> {
  const { data, error } = await supabase
    .from("households")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      address: input.address?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;

  return toHousehold(data as DbHousehold);
}

export async function updateHousehold(
  supabase: SupabaseClient,
  organizationId: string,
  householdId: string,
  input: UpdateHouseholdInput,
): Promise<Household> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.address !== undefined) updates.address = input.address.trim() || null;

  const { data, error } = await supabase
    .from("households")
    .update(updates)
    .eq("id", householdId)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) throw error;

  return toHousehold(data as DbHousehold);
}

export async function setHouseholdHead(
  supabase: SupabaseClient,
  organizationId: string,
  householdId: string,
  personId: string,
): Promise<void> {
  const { data: members, error: fetchError } = await supabase
    .from("people")
    .select("id, role")
    .eq("organization_id", organizationId)
    .eq("household_id", householdId);

  if (fetchError) throw fetchError;

  const now = new Date().toISOString();

  for (const member of members ?? []) {
    if (member.id === personId) {
      const { error } = await supabase
        .from("people")
        .update({ role: "Head", updated_at: now })
        .eq("id", member.id)
        .eq("organization_id", organizationId);
      if (error) throw error;
    } else if (member.role === "Head") {
      const { error } = await supabase
        .from("people")
        .update({ role: "Spouse", updated_at: now })
        .eq("id", member.id)
        .eq("organization_id", organizationId);
      if (error) throw error;
    }
  }
}
