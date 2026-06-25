"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Edit, Plus } from "lucide-react";
import { BulletText } from "./bullet-text";

export function PriorYearActionPointsBanner({
  priorYear,
  actionPoints,
}: {
  priorYear: number;
  actionPoints: string;
}) {
  return (
    <Card className="overflow-hidden border-amber-200/80 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 via-amber-50/50 to-orange-50/30 dark:from-amber-950/30 dark:via-amber-950/20 dark:to-orange-950/10 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-amber-200/60 dark:border-amber-800/40 px-5 py-4 sm:min-w-[200px] sm:max-w-[220px] bg-amber-100/40 dark:bg-amber-900/20">
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80">
                Carry forward
              </p>
              <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                From {priorYear}
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </p>
            </div>
          </div>
          <div className="flex-1 px-5 py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Action points from last year to guide this year&apos;s planning:
            </p>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {actionPoints}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
