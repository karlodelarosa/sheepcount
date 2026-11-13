import type { GrowthTrackPerson } from "../_lib/types";
import { groupByStage } from "../_lib/filters";
import { GROWTH_TRACK_STAGES } from "../_lib/stage-config";
import { PipelineColumn } from "./pipeline-column";

interface PipelineViewTabProps {
  people: GrowthTrackPerson[];
  isSaving: boolean;
  onPersonAction: (person: GrowthTrackPerson) => void;
}

export function PipelineViewTab({
  people,
  isSaving,
  onPersonAction,
}: PipelineViewTabProps) {
  const grouped = groupByStage(people);

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Growth Pipeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow each person’s next step, from their first visit to serving.
        </p>
      </div>
      <div
        role="region"
        aria-label="Growth pipeline stages"
        tabIndex={0}
        className="overflow-x-auto rounded-2xl pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
      >
        <div className="grid grid-cols-5 gap-4 min-w-[1450px]">
          {GROWTH_TRACK_STAGES.map(stage => (
            <PipelineColumn
              key={stage.key}
              stage={stage.key}
              people={grouped[stage.key]}
              isSaving={isSaving}
              onPersonAction={onPersonAction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
