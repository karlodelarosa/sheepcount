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
import {
  createDedicationRecord,
  deleteDedicationRecord,
  fetchDedicationRecords,
  updateDedicationRecordPhoto,
  uploadDedicationPhoto,
  type CreateDedicationRecordInput,
  type DedicationRecord,
} from "@/lib/supabase/dedications";
import { getOrganizationId } from "@/lib/supabase/tenant";

type DedicationContextValue = {
  records: DedicationRecord[];
  hydrated: boolean;
  isSaving: boolean;
  refreshDedications: () => Promise<void>;
  addRecord: (
    input: CreateDedicationRecordInput,
    photoFile?: File | null,
  ) => Promise<DedicationRecord | null>;
  removeRecord: (recordId: string) => Promise<boolean>;
};

const DedicationContext = createContext<DedicationContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function DedicationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, user, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [records, setRecords] = useState<DedicationRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshDedications = useCallback(async () => {
    if (!organizationId) {
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const next = await fetchDedicationRecords(supabase, organizationId);
      setRecords(next);
    } catch (error) {
      console.error("Failed to load dedication records:", error);
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshDedications();
  }, [refreshDedications]);

  const addRecord = useCallback(
    async (
      input: CreateDedicationRecordInput,
      photoFile?: File | null,
    ): Promise<DedicationRecord | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        let record = await createDedicationRecord(
          supabase,
          organizationId,
          input,
          user?.id ?? null,
        );

        if (photoFile) {
          const photoUrl = await uploadDedicationPhoto(
            supabase,
            organizationId,
            record.id,
            photoFile,
          );
          record = await updateDedicationRecordPhoto(
            supabase,
            record.id,
            photoUrl,
          );
        }

        setRecords(prev =>
          [record, ...prev].sort((a, b) =>
            b.dedicatedAt.localeCompare(a.dedicatedAt),
          ),
        );
        toast.success("Dedication recorded");
        return record;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase, user?.id],
  );

  const removeRecord = useCallback(
    async (recordId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await deleteDedicationRecord(supabase, recordId);
        setRecords(prev => prev.filter(r => r.id !== recordId));
        toast.success("Dedication record removed");
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase],
  );

  const value = useMemo(
    () => ({
      records,
      hydrated,
      isSaving,
      refreshDedications,
      addRecord,
      removeRecord,
    }),
    [records, hydrated, isSaving, refreshDedications, addRecord, removeRecord],
  );

  return (
    <DedicationContext.Provider value={value}>
      {children}
    </DedicationContext.Provider>
  );
}

export function useDedication() {
  const context = useContext(DedicationContext);
  if (!context) {
    throw new Error("useDedication must be used within DedicationProvider");
  }
  return context;
}
