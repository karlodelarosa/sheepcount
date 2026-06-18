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
  fetchAttendanceRows,
  fetchServiceTypes,
  recordAttendance as recordAttendanceDb,
  removeSessionAttendee,
  type ServiceAttendanceRow,
  type ServiceCategory,
  type ServiceType,
} from "@/lib/supabase/service-attendance";

export type RecordAttendanceInput = {
  serviceId: string;
  date: string;
  personIds: string[];
};

type ServiceAttendanceContextValue = {
  serviceTypes: ServiceType[];
  attendanceRows: ServiceAttendanceRow[];
  hydrated: boolean;
  isSaving: boolean;
  sundayServiceTypes: ServiceType[];
  lifeGroupServiceTypes: ServiceType[];
  primarySundayServiceId: string | undefined;
  recordAttendance: (input: RecordAttendanceInput) => Promise<string | null>;
  removeAttendee: (attendanceId: string) => Promise<boolean>;
  refreshAttendance: () => Promise<void>;
  getServiceCategory: (serviceId: string) => ServiceCategory | undefined;
};

const ServiceAttendanceContext =
  createContext<ServiceAttendanceContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function ServiceAttendanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<ServiceAttendanceRow[]>(
    [],
  );
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sundayServiceTypes = useMemo(
    () => serviceTypes.filter((s) => s.category === "sunday"),
    [serviceTypes],
  );

  const lifeGroupServiceTypes = useMemo(
    () => serviceTypes.filter((s) => s.category === "life_group"),
    [serviceTypes],
  );

  const primarySundayServiceId = sundayServiceTypes[0]?.id;

  const getServiceCategory = useCallback(
    (serviceId: string) =>
      serviceTypes.find((s) => s.id === serviceId)?.category,
    [serviceTypes],
  );

  const refreshAttendance = useCallback(async () => {
    if (!organizationId) {
      setServiceTypes([]);
      setAttendanceRows([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [types, rows] = await Promise.all([
        fetchServiceTypes(supabase, organizationId),
        fetchAttendanceRows(supabase, organizationId),
      ]);
      setServiceTypes(types);
      setAttendanceRows(rows);
    } catch (error) {
      toast.error("Failed to load attendance", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshAttendance();
  }, [refreshAttendance]);

  const recordAttendance = useCallback(
    async (input: RecordAttendanceInput): Promise<string | null> => {
      if (!organizationId) return null;

      const category = getServiceCategory(input.serviceId);
      if (!category) {
        toast.error("Unknown service type");
        return null;
      }

      setIsSaving(true);
      try {
        const { sessionId } = await recordAttendanceDb(
          supabase,
          organizationId,
          {
            ...input,
            serviceCategory: category,
          },
        );
        await refreshAttendance();
        toast.success("Attendance recorded");
        return sessionId;
      } catch (error) {
        toast.error("Failed to record attendance", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase, getServiceCategory, refreshAttendance],
  );

  const removeAttendee = useCallback(
    async (attendanceId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeSessionAttendee(supabase, attendanceId);
        await refreshAttendance();
        toast.success("Attendee removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove attendee", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [supabase, refreshAttendance],
  );

  const value = useMemo(
    () => ({
      serviceTypes,
      attendanceRows,
      hydrated,
      isSaving,
      sundayServiceTypes,
      lifeGroupServiceTypes,
      primarySundayServiceId,
      recordAttendance,
      removeAttendee,
      refreshAttendance,
      getServiceCategory,
    }),
    [
      serviceTypes,
      attendanceRows,
      hydrated,
      isSaving,
      sundayServiceTypes,
      lifeGroupServiceTypes,
      primarySundayServiceId,
      recordAttendance,
      removeAttendee,
      refreshAttendance,
      getServiceCategory,
    ],
  );

  return (
    <ServiceAttendanceContext.Provider value={value}>
      {children}
    </ServiceAttendanceContext.Provider>
  );
}

export function useServiceAttendance() {
  const context = useContext(ServiceAttendanceContext);
  if (!context) {
    throw new Error(
      "useServiceAttendance must be used within ServiceAttendanceProvider",
    );
  }
  return context;
}
