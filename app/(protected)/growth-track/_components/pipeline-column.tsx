import type { EvangelismStage } from "@/lib/people";
import { EmptyState, panelCard } from "@/app/(protected)/people/_components/person-detail-ui";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div
      className={cn(
        "flex flex-col min-w-[260px] lg:min-w-0 rounded-xl border bg-slate-50/50 dark:bg-zinc-900/30",
        config.columnBorder,
      )}
    >
      <div className={cn("rounded-t-xl px-3 py-3", config.headerBg)}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 shrink-0" />
          <h3 className="font-semibold text-sm leading-tight">
            {stage} ({people.length})
          </h3>
        </div>
        <p className="text-xs opacity-80 mt-0.5">{config.subtext}</p>
      </div>

      <div className="flex-1 p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
        {people.length === 0 ? (
          <div className={panelCard}>
            <EmptyState
              icon={Users}
              title="No one in this stage yet"
              description="People will appear here as they progress through the growth track."
            />
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
    </div>
  );
}
