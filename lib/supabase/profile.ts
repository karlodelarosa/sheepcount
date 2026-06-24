import type { SupabaseClient } from "@supabase/supabase-js";

export const AVATAR_BUCKET = "avatars";
export const ORGANIZATION_LOGO_BUCKET = "organization-logos";

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type UpdateProfileInput = {
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
};

export type UpdateOrganizationInput = {
  name?: string;
  phone?: string | null;
  address?: string | null;
  image?: string | null;
};

function getAvatarExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "jpeg" || fromName === "jpg") return "jpg";
  if (fromName === "png") return "png";
  if (fromName === "webp") return "webp";
  if (fromName === "gif") return "gif";

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      throw new Error("Invalid image type. Use JPEG, PNG, WebP, or GIF.");
  }
}

export function validateAvatarFile(file: File): void {
  if (!AVATAR_MIME_TYPES.has(file.type)) {
    throw new Error("Invalid image type. Use JPEG, PNG, WebP, or GIF.");
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
}

function getAvatarObjectPath(userId: string, extension: string): string {
  return `${userId}/avatar.${extension}`;
}

async function deleteUserAvatarFiles(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(userId);

  if (listError) throw listError;
  if (!files?.length) return;

  const paths = files.map(file => `${userId}/${file.name}`);
  const { error: removeError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove(paths);

  if (removeError) throw removeError;
}

export async function uploadUserAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
) {
  validateAvatarFile(file);

  const extension = getAvatarExtension(file);
  const path = getAvatarObjectPath(userId, extension);

  await deleteUserAvatarFiles(supabase, userId);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

  return updateUserProfile(supabase, userId, { avatar_url: avatarUrl });
}

export async function removeUserAvatar(
  supabase: SupabaseClient,
  userId: string,
) {
  await deleteUserAvatarFiles(supabase, userId);
  return updateUserProfile(supabase, userId, { avatar_url: null });
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput,
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, first_name, last_name, avatar_url, created_at")
    .single();

  if (error) throw error;
  return data;
}

function getOrganizationLogoObjectPath(
  organizationId: string,
  extension: string,
): string {
  return `${organizationId}/logo.${extension}`;
}

async function deleteOrganizationLogoFiles(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(ORGANIZATION_LOGO_BUCKET)
    .list(organizationId);

  if (listError) throw listError;
  if (!files?.length) return;

  const paths = files.map(file => `${organizationId}/${file.name}`);
  const { error: removeError } = await supabase.storage
    .from(ORGANIZATION_LOGO_BUCKET)
    .remove(paths);

  if (removeError) throw removeError;
}

export async function uploadOrganizationLogo(
  supabase: SupabaseClient,
  organizationId: string,
  file: File,
) {
  validateAvatarFile(file);

  const extension = getAvatarExtension(file);
  const path = getOrganizationLogoObjectPath(organizationId, extension);

  await deleteOrganizationLogoFiles(supabase, organizationId);

  const { error: uploadError } = await supabase.storage
    .from(ORGANIZATION_LOGO_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(ORGANIZATION_LOGO_BUCKET)
    .getPublicUrl(path);
  const logoUrl = `${data.publicUrl}?t=${Date.now()}`;

  return updateOrganizationDetails(supabase, organizationId, {
    image: logoUrl,
  });
}

export async function removeOrganizationLogo(
  supabase: SupabaseClient,
  organizationId: string,
) {
  await deleteOrganizationLogoFiles(supabase, organizationId);
  return updateOrganizationDetails(supabase, organizationId, { image: null });
}

export async function updateOrganizationDetails(
  supabase: SupabaseClient,
  organizationId: string,
  input: UpdateOrganizationInput,
) {
  const { data, error } = await supabase
    .from("organizations")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId)
    .select(
      "id, name, slug, plan, status, address, phone, image, created_at, updated_at",
    )
    .single();

  if (error) throw error;
  return data;
}

export async function verifyAccountPassword(
  supabase: SupabaseClient,
  email: string,
  password: string,
) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Incorrect password. Please try again.");
  }
}

export async function cancelOrganizationSubscription(
  supabase: SupabaseClient,
  organizationId: string,
  reason: string,
) {
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new Error("Cancellation reason is required.");
  }

  const { error } = await supabase.rpc("cancel_organization_subscription", {
    p_organization_id: organizationId,
    p_reason: trimmedReason,
  });

  if (error) throw error;
}
