import type { SupabaseClient } from "@supabase/supabase-js";
import { getImageExtension, validateImageFile } from "@/lib/upload-validation";

const MEMORIAL_PHOTO_BUCKET = "memorial-photos";

export type MemorialRecord = {
  id: string;
  personId: string | null;
  deceasedName: string;
  deathDate: string;
  serviceDate: string | null;
  location: string;
  officiantName: string;
  survivedBy: string;
  photoUrl: string;
  notes: string;
  createdBy: string | null;
  createdAt: string;
};

export type CreateMemorialRecordInput = {
  personId?: string | null;
  deceasedName: string;
  deathDate: string;
  serviceDate?: string | null;
  location?: string;
  officiantName?: string;
  survivedBy?: string;
  notes?: string;
};

type DbMemorialRecord = {
  id: string;
  person_id: string | null;
  deceased_name: string;
  death_date: string;
  service_date: string | null;
  location: string;
  officiant_name: string;
  survived_by: string;
  photo_url: string;
  notes: string;
  created_by: string | null;
  created_at: string;
};

const MEMORIAL_SELECT =
  "id, person_id, deceased_name, death_date, service_date, location, officiant_name, survived_by, photo_url, notes, created_by, created_at";

function toMemorialRecord(row: DbMemorialRecord): MemorialRecord {
  return {
    id: row.id,
    personId: row.person_id,
    deceasedName: row.deceased_name,
    deathDate: row.death_date,
    serviceDate: row.service_date,
    location: row.location,
    officiantName: row.officiant_name,
    survivedBy: row.survived_by,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function getMemorialPhotoPath(
  organizationId: string,
  recordId: string,
  extension: string,
): string {
  return `${organizationId}/${recordId}/photo.${extension}`;
}

export async function fetchMemorialRecords(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<MemorialRecord[]> {
  const { data, error } = await supabase
    .from("memorial_records")
    .select(MEMORIAL_SELECT)
    .eq("organization_id", organizationId)
    .order("death_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as DbMemorialRecord[]).map(toMemorialRecord);
}

export async function createMemorialRecord(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateMemorialRecordInput,
  createdBy?: string | null,
): Promise<MemorialRecord> {
  const { data, error } = await supabase
    .from("memorial_records")
    .insert({
      organization_id: organizationId,
      person_id: input.personId ?? null,
      deceased_name: input.deceasedName,
      death_date: input.deathDate,
      service_date: input.serviceDate ?? null,
      location: input.location ?? "",
      officiant_name: input.officiantName ?? "",
      survived_by: input.survivedBy ?? "",
      notes: input.notes ?? "",
      created_by: createdBy ?? null,
    })
    .select(MEMORIAL_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create memorial record");
  }

  return toMemorialRecord(data as DbMemorialRecord);
}

export async function uploadMemorialPhoto(
  supabase: SupabaseClient,
  organizationId: string,
  recordId: string,
  file: File,
): Promise<string> {
  await validateImageFile(file, "Memorial photo");

  const extension = getImageExtension(file);
  const path = getMemorialPhotoPath(organizationId, recordId, extension);

  const { error: uploadError } = await supabase.storage
    .from(MEMORIAL_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(MEMORIAL_PHOTO_BUCKET)
    .getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function updateMemorialRecordPhoto(
  supabase: SupabaseClient,
  recordId: string,
  photoUrl: string,
): Promise<MemorialRecord> {
  const { data, error } = await supabase
    .from("memorial_records")
    .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq("id", recordId)
    .select(MEMORIAL_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to update memorial photo");
  }

  return toMemorialRecord(data as DbMemorialRecord);
}

export async function deleteMemorialRecord(
  supabase: SupabaseClient,
  recordId: string,
): Promise<void> {
  const { error } = await supabase
    .from("memorial_records")
    .delete()
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}
