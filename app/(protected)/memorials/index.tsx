"use client";

import { PageSkeleton } from "@/components/page-skeleton";

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";

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
    return <PageSkeleton message="Loading..." />;
  }

  if (!memorialsEnabled) {
    return (
      <div className="space-y-6">
        <DirectoryTitleCard
          title="Memorial Records"
          description="Keep a record of members who have passed away"
          icon={Cross}
        />

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
