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
  createWeddingRecord,
  deleteWeddingRecord,
  fetchWeddingRecords,
  updateWeddingRecordPhoto,
  uploadWeddingPhoto,
  type CreateWeddingRecordInput,
  type WeddingRecord,
} from "@/lib/supabase/weddings";
import { getOrganizationId } from "@/lib/supabase/tenant";

type WeddingContextValue = {
  records: WeddingRecord[];
  hydrated: boolean;
  isSaving: boolean;
  refreshWeddings: () => Promise<void>;
  addRecord: (
    input: CreateWeddingRecordInput,
    photoFile?: File | null,
  ) => Promise<WeddingRecord | null>;
  removeRecord: (recordId: string) => Promise<boolean>;
};

const WeddingContext = createContext<WeddingContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const { tenant, user, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [records, setRecords] = useState<WeddingRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshWeddings = useCallback(async () => {
    if (!organizationId) {
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const next = await fetchWeddingRecords(supabase, organizationId);
      setRecords(next);
    } catch (error) {
      console.error("Failed to load wedding records:", error);
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshWeddings();
  }, [refreshWeddings]);

  const addRecord = useCallback(
    async (
      input: CreateWeddingRecordInput,
      photoFile?: File | null,
    ): Promise<WeddingRecord | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        let record = await createWeddingRecord(
          supabase,
          organizationId,
          input,
          user?.id ?? null,
        );

        if (photoFile) {
          const photoUrl = await uploadWeddingPhoto(
            supabase,
            organizationId,
            record.id,
            photoFile,
          );
          record = await updateWeddingRecordPhoto(
            supabase,
            record.id,
            photoUrl,
          );
        }

        setRecords(prev =>
          [record, ...prev].sort((a, b) =>
            b.marriedAt.localeCompare(a.marriedAt),
          ),
        );
        toast.success("Wedding recorded");
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
        await deleteWeddingRecord(supabase, recordId);
        setRecords(prev => prev.filter(r => r.id !== recordId));
        toast.success("Wedding record removed");
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
      refreshWeddings,
      addRecord,
      removeRecord,
    }),
    [records, hydrated, isSaving, refreshWeddings, addRecord, removeRecord],
  );

  return (
    <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error("useWedding must be used within WeddingProvider");
  }
  return context;
}
