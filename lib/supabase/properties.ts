import type { SupabaseClient } from "@supabase/supabase-js";

const PROPERTY_IMAGE_BUCKET = "property-images";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type PropertyStatus = "owned" | "borrowed" | "lost";

export type PropertyTypeOption = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type PropertyBorrow = {
  id: string;
  propertyId: string;
  borrowerPersonId: string | null;
  borrowerName: string;
  borrowedAt: string;
  dueAt: string | null;
  returnedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ChurchProperty = {
  id: string;
  organizationId: string;
  name: string;
  propertyTypeId: string;
  typeName: string;
  imageUrl: string | null;
  purchaseDate: string | null;
  estimatedValue: number;
  status: PropertyStatus;
  description: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  borrows: PropertyBorrow[];
};

export type CreatePropertyInput = {
  name: string;
  propertyTypeId: string;
  imageUrl?: string | null;
  purchaseDate: string | null;
  estimatedValue: number;
  status?: PropertyStatus;
  description: string;
  notes: string;
};

export type UpdatePropertyInput = CreatePropertyInput & {
  id: string;
};

export type CreateBorrowInput = {
  propertyId: string;
  borrowerPersonId: string | null;
  borrowerName: string;
  borrowedAt: string;
  dueAt: string | null;
  notes: string;
};

export type UpdateBorrowInput = CreateBorrowInput & {
  id: string;
  returnedAt: string | null;
};

type DbPropertyTypeRow = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

type DbPropertyRow = {
  id: string;
  organization_id: string;
  name: string;
  property_type_id: string;
  image_url: string;
  purchase_date: string | null;
  estimated_value: number | string;
  status: string;
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
  property_types: DbPropertyTypeRow | DbPropertyTypeRow[] | null;
};

type DbBorrowRow = {
  id: string;
  property_id: string;
  borrower_person_id: string | null;
  borrower_name: string;
  borrowed_at: string;
  due_at: string | null;
  returned_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

const DEFAULT_PROPERTY_TYPES = ["Building", "Land", "Vehicle", "Equipment"];

function toAmount(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function toPropertyStatus(value: string): PropertyStatus {
  if (value === "borrowed" || value === "lost") return value;
  return "owned";
}

function toPropertyTypeOption(row: DbPropertyTypeRow): PropertyTypeOption {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function resolveTypeName(row: DbPropertyRow, typeById: Map<string, string>): string {
  const joined = row.property_types;
  if (Array.isArray(joined)) {
    return joined[0]?.name ?? typeById.get(row.property_type_id) ?? "Equipment";
  }
  if (joined?.name) return joined.name;
  return typeById.get(row.property_type_id) ?? "Equipment";
}

function toBorrow(row: DbBorrowRow): PropertyBorrow {
  return {
    id: row.id,
    propertyId: row.property_id,
    borrowerPersonId: row.borrower_person_id,
    borrowerName: row.borrower_name,
    borrowedAt: row.borrowed_at,
    dueAt: row.due_at,
    returnedAt: row.returned_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProperty(
  row: DbPropertyRow,
  borrows: PropertyBorrow[],
  typeById: Map<string, string>,
): ChurchProperty {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    propertyTypeId: row.property_type_id,
    typeName: resolveTypeName(row, typeById),
    imageUrl: row.image_url?.trim() ? row.image_url : null,
    purchaseDate: row.purchase_date,
    estimatedValue: toAmount(row.estimated_value),
    status: toPropertyStatus(row.status),
    description: row.description ?? "",
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    borrows,
  };
}

const PROPERTY_SELECT = `
  id,
  organization_id,
  name,
  property_type_id,
  image_url,
  purchase_date,
  estimated_value,
  status,
  description,
  notes,
  created_at,
  updated_at,
  property_types (
    id,
    name,
    sort_order,
    is_active
  )
`;

const BORROW_SELECT =
  "id, property_id, borrower_person_id, borrower_name, borrowed_at, due_at, returned_at, notes, created_at, updated_at";

function getImageExtension(file: File): string {
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
      return "jpg";
  }
}

function validatePropertyImage(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Image must be JPEG, PNG, WebP, or GIF");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller");
  }
}

function getPropertyImagePath(
  organizationId: string,
  propertyId: string,
  extension: string,
): string {
  return `${organizationId}/${propertyId}/image.${extension}`;
}

export async function fetchPropertyTypesForOrg(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<PropertyTypeOption[]> {
  const { data, error } = await supabase
    .from("property_types")
    .select("id, name, sort_order, is_active")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as DbPropertyTypeRow[]).map(toPropertyTypeOption);
}

export async function seedPropertyTypeDefaults(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const rows = DEFAULT_PROPERTY_TYPES.map((name, index) => ({
    organization_id: organizationId,
    name,
    sort_order: index + 1,
  }));

  const { error } = await supabase
    .from("property_types")
    .upsert(rows, { onConflict: "organization_id,name", ignoreDuplicates: true });

  if (error) throw error;
}

export async function createPropertyType(
  supabase: SupabaseClient,
  organizationId: string,
  name: string,
): Promise<PropertyTypeOption> {
  const trimmed = name.trim();
  const { data: existing } = await supabase
    .from("property_types")
    .select("id, name, sort_order, is_active")
    .eq("organization_id", organizationId)
    .eq("name", trimmed)
    .maybeSingle();

  if (existing) {
    if (existing.is_active) {
      throw new Error("This property type already exists");
    }

    const { data, error } = await supabase
      .from("property_types")
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id, name, sort_order, is_active")
      .single();

    if (error) throw error;
    return toPropertyTypeOption(data as DbPropertyTypeRow);
  }

  const { count } = await supabase
    .from("property_types")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { data, error } = await supabase
    .from("property_types")
    .insert({
      organization_id: organizationId,
      name: trimmed,
      sort_order: (count ?? 0) + 1,
    })
    .select("id, name, sort_order, is_active")
    .single();

  if (error) throw error;
  return toPropertyTypeOption(data as DbPropertyTypeRow);
}

export async function deactivatePropertyType(
  supabase: SupabaseClient,
  typeId: string,
): Promise<void> {
  const { error } = await supabase
    .from("property_types")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", typeId);

  if (error) throw error;
}

async function loadBorrowsByProperty(
  supabase: SupabaseClient,
  propertyIds: string[],
): Promise<Map<string, PropertyBorrow[]>> {
  const byProperty = new Map<string, PropertyBorrow[]>();
  if (propertyIds.length === 0) return byProperty;

  const { data, error } = await supabase
    .from("property_borrows")
    .select(BORROW_SELECT)
    .in("property_id", propertyIds)
    .order("borrowed_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  for (const row of (data ?? []) as DbBorrowRow[]) {
    const borrow = toBorrow(row);
    const list = byProperty.get(borrow.propertyId) ?? [];
    list.push(borrow);
    byProperty.set(borrow.propertyId, list);
  }

  return byProperty;
}

function buildTypeMap(types: PropertyTypeOption[]): Map<string, string> {
  return new Map(types.map(type => [type.id, type.name]));
}

export async function fetchPropertiesForOrg(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<ChurchProperty[]> {
  const types = await fetchPropertyTypesForOrg(supabase, organizationId);
  const typeById = buildTypeMap(types);

  const { data, error } = await supabase
    .from("church_properties")
    .select(PROPERTY_SELECT)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw error;

  const propertyRows = (data ?? []) as DbPropertyRow[];
  const propertyIds = propertyRows.map(p => p.id);
  const borrowsByProperty = await loadBorrowsByProperty(supabase, propertyIds);

  return propertyRows.map(row =>
    toProperty(row, borrowsByProperty.get(row.id) ?? [], typeById),
  );
}

export async function uploadPropertyImage(
  supabase: SupabaseClient,
  organizationId: string,
  propertyId: string,
  file: File,
): Promise<string> {
  validatePropertyImage(file);

  const extension = getImageExtension(file);
  const path = getPropertyImagePath(organizationId, propertyId, extension);

  const { error: uploadError } = await supabase.storage
    .from(PROPERTY_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function createProperty(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreatePropertyInput,
): Promise<ChurchProperty> {
  const { data, error } = await supabase
    .from("church_properties")
    .insert({
      organization_id: organizationId,
      name: input.name,
      property_type_id: input.propertyTypeId,
      image_url: input.imageUrl ?? "",
      purchase_date: input.purchaseDate,
      estimated_value: input.estimatedValue,
      status: input.status ?? "owned",
      description: input.description,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .select(PROPERTY_SELECT)
    .single();

  if (error) throw error;

  const types = await fetchPropertyTypesForOrg(supabase, organizationId);
  return toProperty(data as DbPropertyRow, [], buildTypeMap(types));
}

export async function updateProperty(
  supabase: SupabaseClient,
  organizationId: string,
  input: UpdatePropertyInput,
): Promise<ChurchProperty> {
  const { data, error } = await supabase
    .from("church_properties")
    .update({
      name: input.name,
      property_type_id: input.propertyTypeId,
      image_url: input.imageUrl ?? "",
      purchase_date: input.purchaseDate,
      estimated_value: input.estimatedValue,
      status: input.status ?? "owned",
      description: input.description,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select(PROPERTY_SELECT)
    .single();

  if (error) throw error;

  const types = await fetchPropertyTypesForOrg(supabase, organizationId);
  const borrowsByProperty = await loadBorrowsByProperty(supabase, [input.id]);
  return toProperty(
    data as DbPropertyRow,
    borrowsByProperty.get(input.id) ?? [],
    buildTypeMap(types),
  );
}

export async function updatePropertyStatus(
  supabase: SupabaseClient,
  propertyId: string,
  status: PropertyStatus,
): Promise<void> {
  const { error } = await supabase
    .from("church_properties")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", propertyId);
  if (error) throw error;
}

export async function deleteProperty(
  supabase: SupabaseClient,
  propertyId: string,
): Promise<void> {
  const { error } = await supabase
    .from("church_properties")
    .delete()
    .eq("id", propertyId);
  if (error) throw error;
}

export async function createBorrow(
  supabase: SupabaseClient,
  input: CreateBorrowInput,
): Promise<PropertyBorrow> {
  const { data, error } = await supabase
    .from("property_borrows")
    .insert({
      property_id: input.propertyId,
      borrower_person_id: input.borrowerPersonId,
      borrower_name: input.borrowerName,
      borrowed_at: input.borrowedAt,
      due_at: input.dueAt,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .select(BORROW_SELECT)
    .single();

  if (error) throw error;

  await updatePropertyStatus(supabase, input.propertyId, "borrowed");

  return toBorrow(data as DbBorrowRow);
}

export async function updateBorrow(
  supabase: SupabaseClient,
  input: UpdateBorrowInput,
): Promise<PropertyBorrow> {
  const { data, error } = await supabase
    .from("property_borrows")
    .update({
      property_id: input.propertyId,
      borrower_person_id: input.borrowerPersonId,
      borrower_name: input.borrowerName,
      borrowed_at: input.borrowedAt,
      due_at: input.dueAt,
      returned_at: input.returnedAt,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select(BORROW_SELECT)
    .single();

  if (error) throw error;

  if (input.returnedAt) {
    const { data: activeBorrows, error: activeError } = await supabase
      .from("property_borrows")
      .select("id")
      .eq("property_id", input.propertyId)
      .is("returned_at", null);

    if (activeError) throw activeError;

    if ((activeBorrows ?? []).length === 0) {
      const { data: property, error: propertyError } = await supabase
        .from("church_properties")
        .select("status")
        .eq("id", input.propertyId)
        .single();

      if (propertyError) throw propertyError;

      if ((property as { status: string } | null)?.status !== "lost") {
        await updatePropertyStatus(supabase, input.propertyId, "owned");
      }
    }
  } else {
    await updatePropertyStatus(supabase, input.propertyId, "borrowed");
  }

  return toBorrow(data as DbBorrowRow);
}

export async function deleteBorrow(
  supabase: SupabaseClient,
  borrowId: string,
  propertyId: string,
): Promise<void> {
  const { error } = await supabase
    .from("property_borrows")
    .delete()
    .eq("id", borrowId);
  if (error) throw error;

  const { data: activeBorrows, error: activeError } = await supabase
    .from("property_borrows")
    .select("id")
    .eq("property_id", propertyId)
    .is("returned_at", null);

  if (activeError) throw activeError;

  if ((activeBorrows ?? []).length === 0) {
    const { data: property, error: propertyError } = await supabase
      .from("church_properties")
      .select("status")
      .eq("id", propertyId)
      .single();

    if (propertyError) throw propertyError;

    if ((property as { status: string } | null)?.status !== "lost") {
      await updatePropertyStatus(supabase, propertyId, "owned");
    }
  }
}

export function getActiveBorrow(property: ChurchProperty): PropertyBorrow | null {
  return property.borrows.find(b => !b.returnedAt) ?? null;
}

export function getAllBorrows(properties: ChurchProperty[]): Array<
  PropertyBorrow & { property: ChurchProperty }
> {
  const rows: Array<PropertyBorrow & { property: ChurchProperty }> = [];
  for (const property of properties) {
    for (const borrow of property.borrows) {
      rows.push({ ...borrow, property });
    }
  }
  return rows.sort((a, b) => b.borrowedAt.localeCompare(a.borrowedAt));
}
