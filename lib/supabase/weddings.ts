import type { SupabaseClient } from "@supabase/supabase-js";
import { getImageExtension, validateImageFile } from "@/lib/upload-validation";

const WEDDING_PHOTO_BUCKET = "wedding-photos";

export type WeddingRecord = {
  id: string;
  spouse1Name: string;
  spouse2Name: string;
  marriedAt: string;
  location: string;
  officiantName: string;
  witnesses: string;
  licenseNumber: string;
  licenseAuthority: string;
  photoUrl: string;
  notes: string;
  createdBy: string | null;
  createdAt: string;
};

export type CreateWeddingRecordInput = {
  spouse1Name: string;
  spouse2Name: string;
  marriedAt: string;
  location?: string;
  officiantName?: string;
  witnesses?: string;
  licenseNumber?: string;
  licenseAuthority?: string;
  notes?: string;
};

type DbWeddingRecord = {
  id: string;
  spouse1_name: string;
  spouse2_name: string;
  married_at: string;
  location: string;
  officiant_name: string;
  witnesses: string;
  license_number: string;
  license_authority: string;
  photo_url: string;
  notes: string;
  created_by: string | null;
  created_at: string;
};

const WEDDING_SELECT =
  "id, spouse1_name, spouse2_name, married_at, location, officiant_name, witnesses, license_number, license_authority, photo_url, notes, created_by, created_at";

function toWeddingRecord(row: DbWeddingRecord): WeddingRecord {
  return {
    id: row.id,
    spouse1Name: row.spouse1_name,
    spouse2Name: row.spouse2_name,
    marriedAt: row.married_at,
    location: row.location,
    officiantName: row.officiant_name,
    witnesses: row.witnesses,
    licenseNumber: row.license_number,
    licenseAuthority: row.license_authority,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function getWeddingPhotoPath(
  organizationId: string,
  recordId: string,
  extension: string,
): string {
  return `${organizationId}/${recordId}/photo.${extension}`;
}

export async function fetchWeddingRecords(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<WeddingRecord[]> {
  const { data, error } = await supabase
    .from("wedding_records")
    .select(WEDDING_SELECT)
    .eq("organization_id", organizationId)
    .order("married_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as DbWeddingRecord[]).map(toWeddingRecord);
}

export async function createWeddingRecord(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateWeddingRecordInput,
  createdBy?: string | null,
): Promise<WeddingRecord> {
  const { data, error } = await supabase
    .from("wedding_records")
    .insert({
      organization_id: organizationId,
      spouse1_name: input.spouse1Name,
      spouse2_name: input.spouse2Name,
      married_at: input.marriedAt,
      location: input.location ?? "",
      officiant_name: input.officiantName ?? "",
      witnesses: input.witnesses ?? "",
      license_number: input.licenseNumber ?? "",
      license_authority: input.licenseAuthority ?? "",
      notes: input.notes ?? "",
      created_by: createdBy ?? null,
    })
    .select(WEDDING_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create wedding record");
  }

  return toWeddingRecord(data as DbWeddingRecord);
}

export async function uploadWeddingPhoto(
  supabase: SupabaseClient,
  organizationId: string,
  recordId: string,
  file: File,
): Promise<string> {
  await validateImageFile(file, "Wedding photo");

  const extension = getImageExtension(file);
  const path = getWeddingPhotoPath(organizationId, recordId, extension);

  const { error: uploadError } = await supabase.storage
    .from(WEDDING_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(WEDDING_PHOTO_BUCKET)
    .getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function updateWeddingRecordPhoto(
  supabase: SupabaseClient,
  recordId: string,
  photoUrl: string,
): Promise<WeddingRecord> {
  const { data, error } = await supabase
    .from("wedding_records")
    .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq("id", recordId)
    .select(WEDDING_SELECT)
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to update wedding photo");
  }

  return toWeddingRecord(data as DbWeddingRecord);
}

export async function deleteWeddingRecord(
  supabase: SupabaseClient,
  recordId: string,
): Promise<void> {
  const { error } = await supabase
    .from("wedding_records")
    .delete()
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}
