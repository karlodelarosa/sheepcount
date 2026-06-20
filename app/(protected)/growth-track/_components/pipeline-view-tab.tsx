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
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
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
  );
}
