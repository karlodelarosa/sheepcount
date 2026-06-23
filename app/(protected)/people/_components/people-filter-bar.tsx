"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMembershipDisplayColor,
  getMembershipDisplayLabel,
  MEMBERSHIP_TYPE_OPTIONS,
} from "@/lib/membership-path";
import type { EvangelismStage, MembershipType } from "@/lib/people";
import {
  countActivePeopleFilters,
  DEFAULT_PEOPLE_FILTERS,
  hasActivePeopleFilters,
  type PeopleFilters,
} from "../_lib/filters";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Exited", label: "Exited" },
] as const;

const MEMBERSHIP_OPTIONS: { value: MembershipType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  ...MEMBERSHIP_TYPE_OPTIONS,
];

const STAGE_OPTIONS: { value: EvangelismStage | "all"; label: string }[] = [
  { value: "all", label: "All stages" },
  { value: "First-time Attendee", label: "First-time Attendee" },
  { value: "Follow-up", label: "Follow-up" },
  { value: "Small Group", label: "Small Group" },
  { value: "Discipleship", label: "Discipleship" },
  { value: "Worker", label: "Worker" },
];

const ACHIEVEMENT_OPTIONS = [
  { value: "all", label: "Any achievement" },
  { value: "any", label: "Has achievements" },
  { value: "discipleship", label: "Discipleship badges" },
  { value: "training", label: "Training completed" },
  { value: "none", label: "No achievements" },
] as const;

interface PeopleFilterBarProps {
  filters: PeopleFilters;
  onFiltersChange: (filters: PeopleFilters) => void;
  resultCount?: number;
}

export function PeopleFilterBar({
  filters,
  onFiltersChange,
  resultCount,
}: PeopleFilterBarProps) {
  const activeFilterCount = countActivePeopleFilters(filters);
  const showClear = hasActivePeopleFilters(filters);

  return (
    <div className="space-y-2">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60 dark:bg-zinc-700 dark:border-zinc-600/60">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0" />
          <Input
            placeholder="Search by name, phone, household, or email..."
            value={filters.search}
            onChange={e =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-900 dark:placeholder:text-zinc-400 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.status}
            onValueChange={value =>
              onFiltersChange({
                ...filters,
                status: value as PeopleFilters["status"],
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[140px] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.membershipType}
            onValueChange={value =>
              onFiltersChange({
                ...filters,
                membershipType: value as PeopleFilters["membershipType"],
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {MEMBERSHIP_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl gap-2 border-slate-200/60 dark:border-zinc-600/60"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Advanced
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold text-white dark:bg-purple-600">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(100vw-2rem,320px)] rounded-xl p-4 space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Evangelism stage
                </p>
                <Select
                  value={filters.evangelismStage}
                  onValueChange={value =>
                    onFiltersChange({
                      ...filters,
                      evangelismStage: value as PeopleFilters["evangelismStage"],
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Achievements
                </p>
                <Select
                  value={filters.achievement}
                  onValueChange={value =>
                    onFiltersChange({
                      ...filters,
                      achievement: value as PeopleFilters["achievement"],
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACHIEVEMENT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Prospect
                  </p>
                  <Select
                    value={filters.prospect}
                    onValueChange={value =>
                      onFiltersChange({
                        ...filters,
                        prospect: value as PeopleFilters["prospect"],
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="yes">Prospects only</SelectItem>
                      <SelectItem value="no">Exclude prospects</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    New comer
                  </p>
                  <Select
                    value={filters.newcomer}
                    onValueChange={value =>
                      onFiltersChange({
                        ...filters,
                        newcomer: value as PeopleFilters["newcomer"],
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="yes">New comers only</SelectItem>
                      <SelectItem value="no">Exclude new comers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {showClear && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground"
              onClick={() =>
                onFiltersChange({
                  ...DEFAULT_PEOPLE_FILTERS,
                  search: filters.search,
                })
              }
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {resultCount !== undefined && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 px-1">
          {showClear ? (
            <>
              Showing {resultCount} {resultCount === 1 ? "person" : "people"}{" "}
              matching your filters
            </>
          ) : (
            <>
              {resultCount} {resultCount === 1 ? "person" : "people"} in
              directory
            </>
          )}
        </p>
      )}
    </div>
  );
}
