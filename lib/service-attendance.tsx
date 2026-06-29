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
  deleteSession as deleteSessionDb,
  fetchAttendanceRows,
  fetchServiceTypes,
  recordAttendance as recordAttendanceDb,
  removeSessionAttendee,
  updateSessionServiceType as updateSessionServiceTypeDb,
  updateSessionDetails as updateSessionDetailsDb,
  type ServiceAttendanceRow,
  type ServiceCategory,
  type ServiceType,
} from "@/lib/supabase/service-attendance";

export type RecordAttendanceInput = {
  serviceId: string;
  date: string;
  attendees: {
    personId: string;
    timeOfArrival?: string | null;
  }[];
  successMessage?: string;
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
  changeSessionServiceType: (
    sessionId: string,
    newServiceId: string,
  ) => Promise<{ serviceId: string; sessionId: string; merged: boolean } | null>;
  updateSessionDetails: (input: {
    sessionId: string;
    serviceId: string;
    date: string;
    serviceStartTime: string;
  }) => Promise<{
    serviceId: string;
    sessionId: string;
    date: string;
    merged: boolean;
  } | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;
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

  const primarySundayServiceId =
    sundayServiceTypes.find((s) => s.name === "Sunday Service")?.id ??
    sundayServiceTypes[0]?.id;

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
        toast.success(input.successMessage ?? "Attendance recorded");
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

  const changeSessionServiceType = useCallback(
    async (
      sessionId: string,
      newServiceId: string,
    ): Promise<{
      serviceId: string;
      sessionId: string;
      merged: boolean;
    } | null> => {
      if (!organizationId) return null;

      const category = getServiceCategory(newServiceId);
      if (!category) {
        toast.error("Unknown service type");
        return null;
      }

      setIsSaving(true);
      try {
        const result = await updateSessionServiceTypeDb(
          supabase,
          organizationId,
          {
            sessionId,
            newServiceId,
            newServiceCategory: category,
          },
        );
        await refreshAttendance();
        toast.success(
          result.merged
            ? "Service type updated and merged with an existing session"
            : "Service type updated",
        );
        return result;
      } catch (error) {
        toast.error("Failed to update service type", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase, getServiceCategory, refreshAttendance],
  );

  const updateSessionDetails = useCallback(
    async (input: {
      sessionId: string;
      serviceId: string;
      date: string;
      serviceStartTime: string;
    }) => {
      if (!organizationId) return null;

      const category = getServiceCategory(input.serviceId);
      if (!category) {
        toast.error("Unknown service type");
        return null;
      }

      setIsSaving(true);
      try {
        const result = await updateSessionDetailsDb(
          supabase,
          organizationId,
          {
            ...input,
            serviceCategory: category,
          },
        );
        await refreshAttendance();
        toast.success(
          result.merged
            ? "Session updated and merged with an existing record"
            : "Session details updated",
        );
        return result;
      } catch (error) {
        toast.error("Failed to update session details", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase, getServiceCategory, refreshAttendance],
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!organizationId) return false;

      setIsSaving(true);
      try {
        await deleteSessionDb(supabase, organizationId, sessionId);
        await refreshAttendance();
        toast.success("Attendance session deleted");
        return true;
      } catch (error) {
        toast.error("Failed to delete attendance session", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase, refreshAttendance],
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
      changeSessionServiceType,
      updateSessionDetails,
      deleteSession,
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
      changeSessionServiceType,
      updateSessionDetails,
      deleteSession,
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
