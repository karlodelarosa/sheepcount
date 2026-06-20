"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EvangelismStage } from "@/lib/people";
import type { AssignmentStatus, GrowthTrackFilters } from "../_lib/types";
import { GROWTH_TRACK_STAGES } from "../_lib/stage-config";

interface ControlBarProps {
  filters: GrowthTrackFilters;
  onFiltersChange: (filters: GrowthTrackFilters) => void;
  resultCount?: number;
  context?: "pipeline" | "actions";
}

const ASSIGNMENT_OPTIONS: { value: AssignmentStatus | "all"; label: string }[] =
  [
    { value: "all", label: "All statuses" },
    { value: "unassigned", label: "Unassigned" },
    { value: "pending_placement", label: "Pending Placement" },
    { value: "ready_for_leader", label: "Ready for Leader" },
    { value: "ready_for_discipleship", label: "Ready for Discipleship" },
    { value: "assigned", label: "Assigned" },
  ];

export function ControlBar({
  filters,
  onFiltersChange,
  resultCount,
  context = "pipeline",
}: ControlBarProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.stage !== "all" ||
    filters.assignmentStatus !== "all";

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:bg-zinc-800/50 dark:border-zinc-700/80">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0" />
          <Input
            placeholder="Search by name, stage, or assignment status..."
            value={filters.search}
            onChange={e =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Select
          value={filters.stage}
          onValueChange={value =>
            onFiltersChange({
              ...filters,
              stage: value as EvangelismStage | "all",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {GROWTH_TRACK_STAGES.map(stage => (
              <SelectItem key={stage.key} value={stage.key}>
                {stage.key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assignmentStatus}
          onValueChange={value =>
            onFiltersChange({
              ...filters,
              assignmentStatus: value as AssignmentStatus | "all",
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent>
            {ASSIGNMENT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {resultCount !== undefined && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 px-1">
          {hasActiveFilters ? (
            <>
              Showing {resultCount}{" "}
              {resultCount === 1 ? "person" : "people"}
              {context === "actions" ? " in this action category" : " in pipeline"}
            </>
          ) : (
            <>
              {resultCount} {resultCount === 1 ? "person" : "people"}{" "}
              {context === "actions"
                ? "in this action category"
                : "across all stages"}
            </>
          )}
        </p>
      )}
    </div>
  );
}
