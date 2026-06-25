"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Edit,
  MoreVertical,
  ClipboardList,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import type { YearlyGoal } from "@/lib/supabase/church-goals";
import {
  RetrospectiveSheet,
  getRetrospectiveItemCount,
  type RetrospectiveFormData,
} from "./retrospective-sheet";
import { cn } from "@/lib/utils";

export function YearlyGoalSection({
  goal,
  year,
  isAdmin,
  isSaving,
  onEdit,
  onToggleObjective,
  onSaveRetrospective,
}: {
  goal: YearlyGoal | null;
  year: number;
  isAdmin: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onToggleObjective: (objectiveId: string, completed: boolean) => void;
  onSaveRetrospective: (data: RetrospectiveFormData) => Promise<void>;
}) {
  const [retroOpen, setRetroOpen] = useState(false);
  const retrospectiveCount = getRetrospectiveItemCount(goal);

  if (!goal) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 px-6 py-12 text-center">
        <Target className="w-9 h-9 mx-auto text-muted-foreground/50 mb-3" />
        <p className="font-medium text-foreground">No goal for {year}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          Set a yearly theme and vision to guide the church.
        </p>
        {isAdmin && (
          <Button variant="outline" className="mt-5 gap-2" onClick={onEdit}>
            <Edit className="w-4 h-4" />
            Set up {year}
          </Button>
        )}
      </div>
    );
  }

  const completedCount = goal.objectives.filter(o => o.isCompleted).length;
  const totalObjectives = goal.objectives.length;
  const objectivePercent =
    totalObjectives > 0
      ? Math.round((completedCount / totalObjectives) * 100)
      : 0;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white dark:bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <p className="text-sm font-medium text-white/60 tracking-wide">
              {year} annual goal
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                  aria-label="Goal options"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setRetroOpen(true)}>
                  <ClipboardList className="w-4 h-4" />
                  Year-end retrospective
                  {retrospectiveCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {retrospectiveCount}
                    </span>
                  )}
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                    Edit goal
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="max-w-3xl">
            {goal.theme && goal.title && (
              <p className="text-sm sm:text-base font-medium text-violet-300/90 tracking-wide">
                {goal.theme}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mt-1">
              {goal.title.trim() || goal.theme || `${year} Church Goal`}
            </h2>
            {goal.description && (
              <p className="mt-4 text-sm sm:text-base text-white/65 leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>

          {goal.vision && (
            <blockquote className="mt-8 border-l-2 border-violet-400/80 pl-5 max-w-2xl">
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-light italic">
                {goal.vision}
              </p>
            </blockquote>
          )}
        </div>
      </div>

      {totalObjectives > 0 && (
        <div className="mt-4 rounded-xl border border-border/60 bg-card px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Key objectives
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative h-9 w-9">
                <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-emerald-500"
                    strokeWidth="3"
                    strokeDasharray={`${objectivePercent} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                  {objectivePercent}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {completedCount}/{totalObjectives}
              </span>
            </div>
          </div>

          <ul className="space-y-1">
            {goal.objectives.map(objective => (
              <li
                key={objective.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-2 py-2.5 -mx-2 transition-colors",
                  objective.isCompleted && "opacity-70",
                )}
              >
                {isAdmin ? (
                  <Checkbox
                    checked={objective.isCompleted}
                    disabled={isSaving}
                    onCheckedChange={checked =>
                      onToggleObjective(objective.id, checked === true)
                    }
                    className="mt-0.5"
                  />
                ) : (
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      objective.isCompleted
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm leading-relaxed",
                    objective.isCompleted
                      ? "line-through text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {objective.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RetrospectiveSheet
        open={retroOpen}
        onOpenChange={setRetroOpen}
        goal={goal}
        year={year}
        isAdmin={isAdmin}
        isSaving={isSaving}
        onSave={onSaveRetrospective}
      />
    </>
  );
}
