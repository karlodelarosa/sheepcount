"use client";

import { PageSkeleton } from "@/components/page-skeleton";

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";

import { Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isMenuItemShownInNavigation } from "@/lib/navigation-visibility";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { DedicationRegistry } from "./_components/dedication-registry";

export function DedicationsView() {
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { settings: orgSettings, hydrated: orgSettingsHydrated } =
    useOrganizationSettings();
  const dedicationsEnabled = isMenuItemShownInNavigation(
    "dedications",
    orgSettings,
    entitlements.modules,
  );

  if (entitlementsLoading || !orgSettingsHydrated) {
    return <PageSkeleton message="Loading..." />;
  }

  if (!dedicationsEnabled) {
    return (
      <div className="space-y-6">
        <DirectoryTitleCard
          title="Child Dedication"
          description="Track child dedications and generate certificates for your church"
          icon={Baby}
        />

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <Baby className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Child dedication tracking is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              This module is managed by your platform administrator. Contact
              support if you need child dedication tracking for your church.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DedicationRegistry />;
}
