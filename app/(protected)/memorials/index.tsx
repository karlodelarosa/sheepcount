"use client";

import { Cross } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isMenuItemShownInNavigation } from "@/lib/navigation-visibility";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { MemorialRegistry } from "./_components/memorial-registry";

export function MemorialsView() {
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { settings: orgSettings, hydrated: orgSettingsHydrated } =
    useOrganizationSettings();
  const memorialsEnabled = isMenuItemShownInNavigation(
    "memorials",
    orgSettings,
    entitlements.modules,
  );

  if (entitlementsLoading || !orgSettingsHydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!memorialsEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Memorial Records
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Keep a record of members who have passed away
          </p>
        </div>

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <Cross className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Memorial records are not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              This module is managed by your platform administrator. Contact
              support if you need memorial records for your church.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <MemorialRegistry />;
}
