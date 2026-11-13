"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";

export function PriorYearActionPointsBanner({
  priorYear,
  actionPoints,
}: {
  priorYear: number;
  actionPoints: string;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-border/60 px-5 py-4 sm:min-w-[200px] sm:max-w-[220px] bg-[var(--accent-color-soft)]">
            <div className="rounded-xl bg-card p-2.5 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                Carry forward
              </p>
              <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                From {priorYear}
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
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
