import type { SupabaseClient } from "@supabase/supabase-js";

export type BaptismRecord = {
  id: string;
  personId: string;
  baptizedAt: string;
  location: string;
  officiantPersonId: string | null;
  notes: string;
  createdBy: string | null;
  createdAt: string;
};

export type CreateBaptismRecordInput = {
  personId: string;
  baptizedAt: string;
  location?: string;
  officiantPersonId?: string | null;
  notes?: string;
};

type DbBaptismRecord = {
  id: string;
  person_id: string;
  baptized_at: string;
  location: string;
  officiant_person_id: string | null;
  notes: string;
  created_by: string | null;
  created_at: string;
};

function toBaptismRecord(row: DbBaptismRecord): BaptismRecord {
  return {
    id: row.id,
    personId: row.person_id,
    baptizedAt: row.baptized_at,
    location: row.location,
    officiantPersonId: row.officiant_person_id,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export async function fetchBaptismRecords(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<BaptismRecord[]> {
  const { data, error } = await supabase
    .from("baptism_records")
    .select(
      "id, person_id, baptized_at, location, officiant_person_id, notes, created_by, created_at",
    )
    .eq("organization_id", organizationId)
    .order("baptized_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as DbBaptismRecord[]).map(toBaptismRecord);
}

export async function createBaptismRecord(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateBaptismRecordInput,
  createdBy?: string | null,
): Promise<BaptismRecord> {
  const { data, error } = await supabase
    .from("baptism_records")
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      baptized_at: input.baptizedAt,
      location: input.location ?? "",
      officiant_person_id: input.officiantPersonId ?? null,
      notes: input.notes ?? "",
      created_by: createdBy ?? null,
    })
    .select(
      "id, person_id, baptized_at, location, officiant_person_id, notes, created_by, created_at",
    )
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create baptism record");
  }

  return toBaptismRecord(data as DbBaptismRecord);
}

export async function deleteBaptismRecord(
  supabase: SupabaseClient,
  recordId: string,
): Promise<void> {
  const { error } = await supabase
    .from("baptism_records")
    .delete()
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}

export function getPersonBaptismRecords(
  records: BaptismRecord[],
  personId: string,
): BaptismRecord[] {
  return records
    .filter(r => r.personId === personId)
    .sort((a, b) => b.baptizedAt.localeCompare(a.baptizedAt));
}

export function getLatestBaptismRecord(
  records: BaptismRecord[],
  personId: string,
): BaptismRecord | null {
  const personRecords = getPersonBaptismRecords(records, personId);
  return personRecords[0] ?? null;
}

export function isPersonBaptized(
  records: BaptismRecord[],
  personId: string,
): boolean {
  return records.some(r => r.personId === personId);
}
