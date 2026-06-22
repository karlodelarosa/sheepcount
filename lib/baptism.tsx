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
  createBaptismRecord,
  deleteBaptismRecord,
  fetchBaptismRecords,
  getLatestBaptismRecord,
  getPersonBaptismRecords,
  isPersonBaptized,
  type BaptismRecord,
  type CreateBaptismRecordInput,
} from "@/lib/supabase/baptism";
import { getOrganizationId } from "@/lib/supabase/tenant";

type BaptismContextValue = {
  records: BaptismRecord[];
  hydrated: boolean;
  isSaving: boolean;
  refreshBaptism: () => Promise<void>;
  addRecord: (input: CreateBaptismRecordInput) => Promise<BaptismRecord | null>;
  removeRecord: (recordId: string) => Promise<boolean>;
  getPersonRecords: (personId: string) => BaptismRecord[];
  getLatestRecord: (personId: string) => BaptismRecord | null;
  isBaptized: (personId: string) => boolean;
};

const BaptismContext = createContext<BaptismContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function BaptismProvider({ children }: { children: React.ReactNode }) {
  const { tenant, user, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [records, setRecords] = useState<BaptismRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshBaptism = useCallback(async () => {
    if (!organizationId) {
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const next = await fetchBaptismRecords(supabase, organizationId);
      setRecords(next);
    } catch (error) {
      console.error("Failed to load baptism records:", error);
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshBaptism();
  }, [refreshBaptism]);

  const addRecord = useCallback(
    async (input: CreateBaptismRecordInput): Promise<BaptismRecord | null> => {
      if (!organizationId) return null;

      setIsSaving(true);
      try {
        const record = await createBaptismRecord(
          supabase,
          organizationId,
          input,
          user?.id ?? null,
        );
        setRecords(prev =>
          [record, ...prev].sort((a, b) =>
            b.baptizedAt.localeCompare(a.baptizedAt),
          ),
        );
        toast.success("Baptism recorded");
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
        await deleteBaptismRecord(supabase, recordId);
        setRecords(prev => prev.filter(r => r.id !== recordId));
        toast.success("Baptism record removed");
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

  const getPersonRecords = useCallback(
    (personId: string) => getPersonBaptismRecords(records, personId),
    [records],
  );

  const getLatestRecord = useCallback(
    (personId: string) => getLatestBaptismRecord(records, personId),
    [records],
  );

  const isBaptized = useCallback(
    (personId: string) => isPersonBaptized(records, personId),
    [records],
  );

  const value = useMemo(
    () => ({
      records,
      hydrated,
      isSaving,
      refreshBaptism,
      addRecord,
      removeRecord,
      getPersonRecords,
      getLatestRecord,
      isBaptized,
    }),
    [
      records,
      hydrated,
      isSaving,
      refreshBaptism,
      addRecord,
      removeRecord,
      getPersonRecords,
      getLatestRecord,
      isBaptized,
    ],
  );

  return (
    <BaptismContext.Provider value={value}>{children}</BaptismContext.Provider>
  );
}

export function useBaptism() {
  const context = useContext(BaptismContext);
  if (!context) {
    throw new Error("useBaptism must be used within BaptismProvider");
  }
  return context;
}

export function useBaptismOptional() {
  return useContext(BaptismContext);
}
