import type { EvangelismStage } from "@/lib/people";

import { Users } from "lucide-react";

import type { GrowthTrackPerson } from "../_lib/types";
import { getStageConfig } from "../_lib/stage-config";
import { PersonStageCard } from "./person-stage-card";

interface PipelineColumnProps {
  stage: EvangelismStage;
  people: GrowthTrackPerson[];
  isSaving: boolean;
  onPersonAction: (person: GrowthTrackPerson) => void;
}

export function PipelineColumn({
  stage,
  people,
  isSaving,
  onPersonAction,
}: PipelineColumnProps) {
  const config = getStageConfig(stage);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <section
      aria-label={stage}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-muted/30"
    >
      <div className="border-b border-border/60 bg-card px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <h3 className="font-semibold text-sm leading-tight">{stage}</h3>
          <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums">
            {people.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{config.subtext}</p>
      </div>

      <div className="flex-1 p-3 space-y-3">
        {people.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-6 text-center">
            <Users
              aria-hidden="true"
              className="mb-3 size-6 text-muted-foreground"
            />
            <p className="text-sm font-medium">No one in this stage</p>
            <p className="mt-1 text-xs text-muted-foreground">
              People appear here as they progress.
            </p>
          </div>
        ) : (
          people.map(person => (
            <PersonStageCard
              key={person.id}
              person={person}
              isSaving={isSaving}
              onAction={onPersonAction}
            />
          ))
        )}
      </div>
    </section>
  );
}
