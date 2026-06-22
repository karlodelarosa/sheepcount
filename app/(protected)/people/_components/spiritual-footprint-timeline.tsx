"use client";

import { CalendarDays } from "lucide-react";
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
        icon={CalendarDays}
        title="Spiritual Footprint"
        description="Timeline across cell, discipleship, training, baptism, and events"
      />
      <div className="mt-3 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
        {timeline.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
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
                  className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-slate-400 dark:border-zinc-900 dark:bg-zinc-500"
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
