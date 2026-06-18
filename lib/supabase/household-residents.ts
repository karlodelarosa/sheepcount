import type { SupabaseClient } from "@supabase/supabase-js";
import { formatPersonName } from "@/lib/person-name";

export type OtherResidentRelation = "Tenant" | "Friend" | "Relative" | "Other";

export interface HouseholdOtherResident {
  id: string;
  householdId: string;
  firstName: string;
  lastName: string;
  name: string;
  relation: OtherResidentRelation;
  phone: string;
  notes: string;
}

type DbOtherResident = {
  id: string;
  organization_id: string;
  household_id: string;
  first_name: string;
  last_name: string;
  relation: string;
  phone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toOtherResident(row: DbOtherResident): HouseholdOtherResident {
  const firstName = row.first_name ?? "";
  const lastName = row.last_name ?? "";
  return {
    id: row.id,
    householdId: row.household_id,
    firstName,
    lastName,
    name: formatPersonName({ firstName, lastName }),
    relation: row.relation as OtherResidentRelation,
    phone: row.phone ?? "",
    notes: row.notes ?? "",
  };
}

export type OtherResidentInput = {
  firstName: string;
  lastName?: string;
  relation: OtherResidentRelation;
  phone?: string;
  notes?: string;
};

export async function fetchOtherResidents(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<HouseholdOtherResident[]> {
  const { data, error } = await supabase
    .from("household_other_residents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("last_name")
    .order("first_name");

  if (error) throw error;

  return (data as DbOtherResident[]).map(toOtherResident);
}

export async function createOtherResident(
  supabase: SupabaseClient,
  organizationId: string,
  householdId: string,
  input: OtherResidentInput,
): Promise<HouseholdOtherResident> {
  const { data, error } = await supabase
    .from("household_other_residents")
    .insert({
      organization_id: organizationId,
      household_id: householdId,
      first_name: input.firstName.trim(),
      last_name: input.lastName?.trim() ?? "",
      relation: input.relation,
      phone: input.phone?.trim() ?? "",
      notes: input.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;

  return toOtherResident(data as DbOtherResident);
}

export async function updateOtherResident(
  supabase: SupabaseClient,
  organizationId: string,
  residentId: string,
  input: Partial<OtherResidentInput>,
): Promise<HouseholdOtherResident> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.firstName !== undefined) updates.first_name = input.firstName.trim();
  if (input.lastName !== undefined) updates.last_name = input.lastName.trim();
  if (input.relation !== undefined) updates.relation = input.relation;
  if (input.phone !== undefined) updates.phone = input.phone.trim();
  if (input.notes !== undefined) updates.notes = input.notes.trim() || null;

  const { data, error } = await supabase
    .from("household_other_residents")
    .update(updates)
    .eq("id", residentId)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) throw error;

  return toOtherResident(data as DbOtherResident);
}

export async function deleteOtherResident(
  supabase: SupabaseClient,
  organizationId: string,
  residentId: string,
): Promise<void> {
  const { error } = await supabase
    .from("household_other_residents")
    .delete()
    .eq("id", residentId)
    .eq("organization_id", organizationId);

  if (error) throw error;
}
