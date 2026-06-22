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
  fetchOrganizationSettings,
  updateOrganizationSettings,
} from "@/lib/supabase/organization-settings";
import { getOrganizationId } from "@/lib/supabase/tenant";
import type { OrganizationSettings } from "@/lib/types/organization-settings";

type OrganizationSettingsContextValue = {
  settings: OrganizationSettings;
  hydrated: boolean;
  isSaving: boolean;
  refreshSettings: () => Promise<void>;
  setWaterBaptismEnabled: (enabled: boolean) => Promise<boolean>;
};

const OrganizationSettingsContext =
  createContext<OrganizationSettingsContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function OrganizationSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [settings, setSettings] = useState<OrganizationSettings>({
    waterBaptismEnabled: false,
  });
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshSettings = useCallback(async () => {
    if (!organizationId) {
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const next = await fetchOrganizationSettings(supabase, organizationId);
      setSettings(next);
    } catch (error) {
      console.error("Failed to load organization settings:", error);
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const setWaterBaptismEnabled = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (!organizationId) return false;

      setIsSaving(true);
      try {
        const next = await updateOrganizationSettings(supabase, organizationId, {
          waterBaptismEnabled: enabled,
        });
        setSettings(next);
        toast.success(
          enabled
            ? "Water baptism tracking enabled"
            : "Water baptism tracking disabled",
        );
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, supabase],
  );

  const value = useMemo(
    () => ({
      settings,
      hydrated,
      isSaving,
      refreshSettings,
      setWaterBaptismEnabled,
    }),
    [settings, hydrated, isSaving, refreshSettings, setWaterBaptismEnabled],
  );

  return (
    <OrganizationSettingsContext.Provider value={value}>
      {children}
    </OrganizationSettingsContext.Provider>
  );
}

export function useOrganizationSettings() {
  const context = useContext(OrganizationSettingsContext);
  if (!context) {
    throw new Error(
      "useOrganizationSettings must be used within OrganizationSettingsProvider",
    );
  }
  return context;
}

export function useOrganizationSettingsOptional() {
  return useContext(OrganizationSettingsContext);
}
