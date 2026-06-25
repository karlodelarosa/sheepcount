"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  createBorrow,
  createProperty,
  createPropertyType,
  deactivatePropertyType,
  deleteBorrow,
  deleteProperty,
  fetchPropertiesForOrg,
  fetchPropertyTypesForOrg,
  seedPropertyTypeDefaults,
  updateBorrow,
  updateProperty,
  uploadPropertyImage,
  type ChurchProperty,
  type CreateBorrowInput,
  type CreatePropertyInput,
  type PropertyBorrow,
  type PropertyTypeOption,
  type UpdateBorrowInput,
  type UpdatePropertyInput,
} from "@/lib/supabase/properties";

type PropertiesContextValue = {
  properties: ChurchProperty[];
  propertyTypes: PropertyTypeOption[];
  activePropertyTypes: PropertyTypeOption[];
  hydrated: boolean;
  isSaving: boolean;
  refreshProperties: () => Promise<void>;
  getProperty: (propertyId: string) => ChurchProperty | null;
  createProperty: (
    input: CreatePropertyInput,
    imageFile?: File | null,
  ) => Promise<ChurchProperty | null>;
  updateProperty: (
    input: UpdatePropertyInput,
    imageFile?: File | null,
  ) => Promise<ChurchProperty | null>;
  deleteProperty: (propertyId: string) => Promise<boolean>;
  createBorrow: (input: CreateBorrowInput) => Promise<PropertyBorrow | null>;
  updateBorrow: (input: UpdateBorrowInput) => Promise<PropertyBorrow | null>;
  deleteBorrow: (borrowId: string, propertyId: string) => Promise<boolean>;
  addPropertyType: (name: string) => Promise<boolean>;
  removePropertyType: (typeId: string) => Promise<boolean>;
};

const PropertiesContext = createContext<PropertiesContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

function attachBorrow(
  properties: ChurchProperty[],
  propertyId: string,
  borrow: PropertyBorrow,
): ChurchProperty[] {
  return properties.map(property => {
    if (property.id !== propertyId) return property;
    return {
      ...property,
      status: "borrowed",
      borrows: [borrow, ...property.borrows],
    };
  });
}

function replaceBorrow(
  properties: ChurchProperty[],
  propertyId: string,
  borrow: PropertyBorrow,
): ChurchProperty[] {
  return properties.map(property => {
    if (property.id !== propertyId) return property;
    const activeBorrows = property.borrows.filter(
      b => b.id !== borrow.id && !b.returnedAt,
    );
    const nextStatus =
      borrow.returnedAt && activeBorrows.length === 0 && property.status !== "lost"
        ? "owned"
        : !borrow.returnedAt
          ? "borrowed"
          : property.status;
    return {
      ...property,
      status: nextStatus,
      borrows: property.borrows.map(b => (b.id === borrow.id ? borrow : b)),
    };
  });
}

function detachBorrow(
  properties: ChurchProperty[],
  propertyId: string,
  borrowId: string,
): ChurchProperty[] {
  return properties.map(property => {
    if (property.id !== propertyId) return property;
    const remaining = property.borrows.filter(b => b.id !== borrowId);
    const hasActive = remaining.some(b => !b.returnedAt);
    const nextStatus =
      !hasActive && property.status !== "lost" ? "owned" : property.status;
    return {
      ...property,
      status: nextStatus,
      borrows: remaining,
    };
  });
}

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [properties, setProperties] = useState<ChurchProperty[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeOption[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshProperties = useCallback(async () => {
    if (!organizationId) {
      setProperties([]);
      setPropertyTypes([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      await seedPropertyTypeDefaults(supabase, organizationId);
      const [data, types] = await Promise.all([
        fetchPropertiesForOrg(supabase, organizationId),
        fetchPropertyTypesForOrg(supabase, organizationId),
      ]);
      setProperties(data);
      setPropertyTypes(types);
    } catch (error) {
      toast.error("Failed to load properties", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshProperties();
  }, [refreshProperties]);

  const activePropertyTypes = useMemo(
    () => propertyTypes.filter(type => type.isActive),
    [propertyTypes],
  );

  const getProperty = useCallback(
    (propertyId: string) => properties.find(p => p.id === propertyId) ?? null,
    [properties],
  );

  const createPropertyHandler = useCallback(
    async (input: CreatePropertyInput, imageFile?: File | null) => {
      if (!organizationId) return null;
      setIsSaving(true);
      try {
        let property = await createProperty(supabase, organizationId, input);

        if (imageFile) {
          const imageUrl = await uploadPropertyImage(
            supabase,
            organizationId,
            property.id,
            imageFile,
          );
          property = await updateProperty(supabase, organizationId, {
            ...input,
            id: property.id,
            imageUrl,
          });
        }

        setProperties(prev =>
          [...prev, property].sort((a, b) => a.name.localeCompare(b.name)),
        );
        return property;
      } catch (error) {
        toast.error("Failed to create property", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const updatePropertyHandler = useCallback(
    async (input: UpdatePropertyInput, imageFile?: File | null) => {
      if (!organizationId) return null;
      setIsSaving(true);
      try {
        let nextInput = input;
        if (imageFile) {
          const imageUrl = await uploadPropertyImage(
            supabase,
            organizationId,
            input.id,
            imageFile,
          );
          nextInput = { ...input, imageUrl };
        }

        const property = await updateProperty(supabase, organizationId, nextInput);
        setProperties(prev =>
          prev.map(p => (p.id === property.id ? property : p)),
        );
        return property;
      } catch (error) {
        toast.error("Failed to update property", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const deletePropertyHandler = useCallback(
    async (propertyId: string) => {
      setIsSaving(true);
      try {
        await deleteProperty(supabase, propertyId);
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        return true;
      } catch (error) {
        toast.error("Failed to delete property", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const createBorrowHandler = useCallback(
    async (input: CreateBorrowInput) => {
      setIsSaving(true);
      try {
        const borrow = await createBorrow(supabase, input);
        setProperties(prev => attachBorrow(prev, input.propertyId, borrow));
        return borrow;
      } catch (error) {
        toast.error("Failed to record borrow", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const updateBorrowHandler = useCallback(
    async (input: UpdateBorrowInput) => {
      setIsSaving(true);
      try {
        const borrow = await updateBorrow(supabase, input);
        setProperties(prev => replaceBorrow(prev, input.propertyId, borrow));
        return borrow;
      } catch (error) {
        toast.error("Failed to update borrow record", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const deleteBorrowHandler = useCallback(
    async (borrowId: string, propertyId: string) => {
      setIsSaving(true);
      try {
        await deleteBorrow(supabase, borrowId, propertyId);
        setProperties(prev => detachBorrow(prev, propertyId, borrowId));
        return true;
      } catch (error) {
        toast.error("Failed to delete borrow record", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const addPropertyType = useCallback(
    async (name: string) => {
      if (!organizationId) return false;
      setIsSaving(true);
      try {
        const created = await createPropertyType(supabase, organizationId, name);
        setPropertyTypes(prev => {
          const existing = prev.find(type => type.id === created.id);
          if (existing) {
            return prev.map(type => (type.id === created.id ? created : type));
          }
          return [...prev, created].sort(
            (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
          );
        });
        return true;
      } catch (error) {
        toast.error("Failed to add property type", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const removePropertyType = useCallback(
    async (typeId: string) => {
      const activeCount = propertyTypes.filter(type => type.isActive).length;
      if (activeCount <= 1) {
        toast.error("At least one property type is required");
        return false;
      }

      const inUse = properties.some(property => property.propertyTypeId === typeId);
      if (inUse) {
        toast.error("Cannot remove a type that is assigned to properties");
        return false;
      }

      setIsSaving(true);
      try {
        await deactivatePropertyType(supabase, typeId);
        setPropertyTypes(prev =>
          prev.map(type =>
            type.id === typeId ? { ...type, isActive: false } : type,
          ),
        );
        return true;
      } catch (error) {
        toast.error("Failed to remove property type", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [properties, propertyTypes, supabase],
  );

  const value = useMemo<PropertiesContextValue>(
    () => ({
      properties,
      propertyTypes,
      activePropertyTypes,
      hydrated,
      isSaving,
      refreshProperties,
      getProperty,
      createProperty: createPropertyHandler,
      updateProperty: updatePropertyHandler,
      deleteProperty: deletePropertyHandler,
      createBorrow: createBorrowHandler,
      updateBorrow: updateBorrowHandler,
      deleteBorrow: deleteBorrowHandler,
      addPropertyType,
      removePropertyType,
    }),
    [
      properties,
      propertyTypes,
      activePropertyTypes,
      hydrated,
      isSaving,
      refreshProperties,
      getProperty,
      createPropertyHandler,
      updatePropertyHandler,
      deletePropertyHandler,
      createBorrowHandler,
      updateBorrowHandler,
      deleteBorrowHandler,
      addPropertyType,
      removePropertyType,
    ],
  );

  return (
    <PropertiesContext.Provider value={value}>
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties(): PropertiesContextValue {
  const ctx = useContext(PropertiesContext);
  if (!ctx) {
    throw new Error("useProperties must be used within PropertiesProvider");
  }
  return ctx;
}
