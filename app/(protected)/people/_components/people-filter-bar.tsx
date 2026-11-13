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
import { MEMBERSHIP_TYPE_OPTIONS } from "@/lib/membership-path";
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
  { value: "Deceased", label: "Deceased" },
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
  search: string;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: PeopleFilters) => void;
}

export function PeopleFilterBar({
  filters,
  search,
  onSearchChange,
  onFiltersChange,
}: PeopleFilterBarProps) {
  const activeFilterCount = countActivePeopleFilters(filters);
  const showClear = hasActivePeopleFilters(filters);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-border/80 bg-background px-3 shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent-color)]">
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Search people"
            placeholder="Search name, phone, email, or household..."
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            className="h-10 border-0 bg-transparent px-0 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:shrink-0">
          <Select
            value={filters.status}
            onValueChange={value =>
              onFiltersChange({
                ...filters,
                status: value as PeopleFilters["status"],
              })
            }
          >
            <SelectTrigger
              aria-label="Filter by status"
              className="min-h-11 w-full rounded-xl bg-background shadow-sm lg:w-40"
            >
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
            <SelectTrigger
              aria-label="Filter by membership type"
              className="min-h-11 w-full rounded-xl bg-background shadow-sm lg:w-44"
            >
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
                className="min-h-11 w-full gap-2 rounded-xl border-border/80 bg-background shadow-sm lg:w-auto"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-color)] px-1.5 text-[10px] font-semibold text-[var(--accent-color-foreground)]">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(100vw-2rem,320px)] space-y-4 rounded-xl p-4"
            >
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Evangelism stage
                </p>
                <Select
                  value={filters.evangelismStage}
                  onValueChange={value =>
                    onFiltersChange({
                      ...filters,
                      evangelismStage:
                        value as PeopleFilters["evangelismStage"],
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
                <p className="text-sm font-medium text-foreground">
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
                  <p className="text-sm font-medium text-foreground">
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
                  <p className="text-sm font-medium text-foreground">
                    Newcomer
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
              className="min-h-11 rounded-xl text-muted-foreground sm:col-span-3 lg:min-h-0"
              onClick={() =>
                onFiltersChange({
                  ...DEFAULT_PEOPLE_FILTERS,
                  search,
                })
              }
            >
              <X className="mr-1 size-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
