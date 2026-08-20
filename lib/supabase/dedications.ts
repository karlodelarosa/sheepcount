import type { SupabaseClient } from "@supabase/supabase-js";
import { getImageExtension, validateImageFile } from "@/lib/upload-validation";

const DEDICATION_PHOTO_BUCKET = "dedication-photos";

export type DedicationRecord = {
  id: string;
  childName: string;
  parentNames: string;
  dedicatedAt: string;
  location: string;
  officiantName: string;
  sponsors: string;
  photoUrl: string;
  notes: string;
  createdBy: string | null;
  createdAt: string;
};

export type CreateDedicationRecordInput = {
  childName: string;
  parentNames?: string;
  dedicatedAt: string;
  location?: string;
  officiantName?: string;
  sponsors?: string;
  notes?: string;
};

type DbDedicationRecord = {
  id: string;
  child_name: string;
  parent_names: string;
  dedicated_at: string;
  location: string;
  officiant_name: string;
  sponsors: string;
  photo_url: string;
  notes: string;
  created_by: string | null;
  created_at: string;
};

const DEDICATION_SELECT =
  "id, child_name, parent_names, dedicated_at, location, officiant_name, sponsors, photo_url, notes, created_by, created_at";

function toDedicationRecord(row: DbDedicationRecord): DedicationRecord {
  return {
    id: row.id,
    childName: row.child_name,
    parentNames: row.parent_names,
    dedicatedAt: row.dedicated_at,
    location: row.location,
    officiantName: row.officiant_name,
    sponsors: row.sponsors,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function getDedicationPhotoPath(
  organizationId: string,
  recordId: string,
  extension: string,
): string {
  return `${organizationId}/${recordId}/photo.${extension}`;
}

export async function fetchDedicationRecords(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DedicationRecord[]> {
  const { data, error } = await supabase
    .from("dedication_records")
    .select(DEDICATION_SELECT)
    .eq("organization_id", organizationId)
    .order("dedicated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as DbDedicationRecord[]).map(toDedicationRecord);
}

export async function createDedicationRecord(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateDedicationRecordInput,
  createdBy?: string | null,
): Promise<DedicationRecord> {
  const { data, error } = await supabase
    .from("dedication_records")
    .insert({
      organization_id: organizationId,
      child_name: input.childName,
      parent_names: input.parentNames ?? "",
      dedicated_at: input.dedicatedAt,
      location: input.location ?? "",
      officiant_name: input.officiantName ?? "",
      sponsors: input.sponsors ?? "",
      notes: input.notes ?? "",
      created_by: createdBy ?? null,
    })
    .select(DEDICATION_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create dedication record");
  }

  return toDedicationRecord(data as DbDedicationRecord);
}

export async function uploadDedicationPhoto(
  supabase: SupabaseClient,
  organizationId: string,
  recordId: string,
  file: File,
): Promise<string> {
  await validateImageFile(file, "Dedication photo");

  const extension = getImageExtension(file);
  const path = getDedicationPhotoPath(organizationId, recordId, extension);

  const { error: uploadError } = await supabase.storage
    .from(DEDICATION_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(DEDICATION_PHOTO_BUCKET)
    .getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function updateDedicationRecordPhoto(
  supabase: SupabaseClient,
  recordId: string,
  photoUrl: string,
): Promise<DedicationRecord> {
  const { data, error } = await supabase
    .from("dedication_records")
    .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq("id", recordId)
    .select(DEDICATION_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to update dedication photo");
  }

  return toDedicationRecord(data as DbDedicationRecord);
}

export async function deleteDedicationRecord(
  supabase: SupabaseClient,
  recordId: string,
): Promise<void> {
  const { error } = await supabase
    .from("dedication_records")
    .delete()
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}
