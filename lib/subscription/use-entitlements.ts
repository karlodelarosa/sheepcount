"use client";

import { useTenant } from "@/app/providers/tenant-provider";
import { BASIC_ENTITLEMENTS_FALLBACK } from "@/lib/subscription/entitlements";

export function useEntitlements() {
  const { tenant, isLoading } = useTenant();
  return {
    entitlements: tenant?.entitlements ?? BASIC_ENTITLEMENTS_FALLBACK,
    isLoading,
  };
}
