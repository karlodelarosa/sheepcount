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
import { usePeople } from "@/lib/people";
import {
  createMemorialRecord,
  deleteMemorialRecord,
  fetchMemorialRecords,
  updateMemorialRecordPhoto,
  uploadMemorialPhoto,
  type CreateMemorialRecordInput,
  type MemorialRecord,
} from "@/lib/supabase/memorials";
import { getOrganizationId } from "@/lib/supabase/tenant";

type MemorialContextValue = {
  records: MemorialRecord[];
  hydrated: boolean;
  isSaving: boolean;
  refreshMemorials: () => Promise<void>;
  addRecord: (
    input: CreateMemorialRecordInput,
    photoFile?: File | null,
  ) => Promise<MemorialRecord | null>;
  removeRecord: (recordId: string) => Promise<boolean>;
};

const MemorialContext = createContext<MemorialContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function MemorialProvider({ children }: { children: React.ReactNode }) {
  const { tenant, user, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);
  const { updatePerson } = usePeople();

  const [records, setRecords] = useState<MemorialRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshMemorials = useCallback(async () => {
    if (!organizationId) {
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const next = await fetchMemorialRecords(supabase, organizationId);
      setRecords(next);
    } catch (error) {
      console.error("Failed to load memorial records:", error);
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshMemorials();
  }, [refreshMemorials]);

  const addRecord = useCallback(
    async (
      input: CreateMemorialRecordInput,
      photoFile?: File | null,
    ): Promise<MemorialRecord | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        let record = await createMemorialRecord(
          supabase,
          organizationId,
          input,
          user?.id ?? null,
        );

        if (photoFile) {
          const photoUrl = await uploadMemorialPhoto(
            supabase,
            organizationId,
            record.id,
            photoFile,
          );
          record = await updateMemorialRecordPhoto(
            supabase,
            record.id,
            photoUrl,
          );
        }

        if (record.personId) {
          await updatePerson(record.personId, { status: "Deceased" });
        }

        setRecords(prev =>
          [record, ...prev].sort((a, b) =>
            b.deathDate.localeCompare(a.deathDate),
          ),
        );
        toast.success("Memorial recorded");
        return record;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase, user?.id, updatePerson],
  );

  const removeRecord = useCallback(
    async (recordId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await deleteMemorialRecord(supabase, recordId);
        setRecords(prev => prev.filter(r => r.id !== recordId));
        toast.success("Memorial record removed");
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
      refreshMemorials,
      addRecord,
      removeRecord,
    }),
    [records, hydrated, isSaving, refreshMemorials, addRecord, removeRecord],
  );

  return (
    <MemorialContext.Provider value={value}>
      {children}
    </MemorialContext.Provider>
  );
}

export function useMemorial() {
  const context = useContext(MemorialContext);
  if (!context) {
    throw new Error("useMemorial must be used within MemorialProvider");
  }
  return context;
}
