"use client";

import { Sprout } from "lucide-react";
import type { PersonProfileTimelineEntry } from "@/lib/supabase/person-profile";
import { EmptyState, panelCard, SectionHeader } from "./person-detail-ui";
import { cn } from "@/lib/utils";

type SpiritualFootprintTimelineProps = {
  timeline: PersonProfileTimelineEntry[];
  className?: string;
};

export function SpiritualFootprintTimeline({
  timeline,
  className,
}: SpiritualFootprintTimelineProps) {
  return (
    <div className={cn(panelCard, "p-4", className)}>
      <SectionHeader
        icon={Sprout}
        title="Spiritual Journey"
        description="A snapshot of their journey through church life"
      />
      <div className="mt-4 max-h-[34rem] overflow-y-auto pr-1">
        {timeline.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="No history yet"
            description="Activity appears here as this person participates in church life."
          />
        ) : (
          <div className="relative space-y-0">
            <div
              className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-zinc-700"
              aria-hidden
            />
            {timeline.map((entry, i) => (
              <div
                key={`${entry.kind}-${entry.date}-${i}`}
                className="relative flex gap-2.5 pb-3 last:pb-0"
              >
                <span
                  className="relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-card bg-[var(--accent-color)]"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                    {new Date(entry.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </p>
                  <p className="text-xs font-medium text-slate-900 dark:text-white leading-snug mt-0.5">
                    {entry.label}
                  </p>
                  {entry.detail && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5 line-clamp-2">
                      {entry.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
