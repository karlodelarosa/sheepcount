"use client";

import Link from "next/link";
import { Droplets, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { BaptismRegistry } from "./_components/baptism-registry";

export function WaterBaptismView() {
  const { settings, hydrated } = useOrganizationSettings();

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!settings.waterBaptismEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Water Baptism
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Track baptisms and generate certificates for your church
          </p>
        </div>

        <Card className="border-slate-200/70 dark:border-zinc-700/70">
          <CardContent className="py-16 text-center">
            <Droplets className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Water baptism tracking is disabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              Enable this feature in Settings to record baptisms, view the
              registry, and generate digital certificates.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Open Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <BaptismRegistry />;
}
