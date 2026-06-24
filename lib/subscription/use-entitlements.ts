"use client";

import { useTenant } from "@/app/providers/tenant-provider";
import {
  BASIC_ENTITLEMENTS_FALLBACK,
  LOADING_ENTITLEMENTS_FALLBACK,
} from "@/lib/subscription/entitlements";

export function useEntitlements() {
  const { tenant, isLoading } = useTenant();
  return {
    entitlements: isLoading
      ? LOADING_ENTITLEMENTS_FALLBACK
      : (tenant?.entitlements ?? BASIC_ENTITLEMENTS_FALLBACK),
    isLoading,
  };
}
