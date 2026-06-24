"use client";

import { Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import { BaptismRegistry } from "./_components/baptism-registry";

export function WaterBaptismView() {
  const { entitlements, isLoading } = useEntitlements();
  const waterBaptismEnabled = isItemEnabled(
    entitlements.modules,
    "water_baptism",
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!waterBaptismEnabled) {
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
              Water baptism tracking is not enabled
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              This module is managed by your platform administrator. Contact
              support if you need water baptism tracking for your church.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <BaptismRegistry />;
}
