"use client";

import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isMenuItemShownInNavigation } from "@/lib/navigation-visibility";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { WeddingRegistry } from "./_components/wedding-registry";

export function WeddingsView() {
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { settings: orgSettings, hydrated: orgSettingsHydrated } =
    useOrganizationSettings();
  const weddingsEnabled = isMenuItemShownInNavigation(
    "weddings",
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

  if (!weddingsEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Weddings
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Track weddings and generate certificates for your church
          </p>
        </div>

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <Heart className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Wedding tracking is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              This module is managed by your platform administrator. Contact
              support if you need wedding tracking for your church.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <WeddingRegistry />;
}
