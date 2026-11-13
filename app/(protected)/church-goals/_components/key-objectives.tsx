"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList } from "lucide-react";
import type { YearlyGoal } from "@/lib/supabase/church-goals";
import { cn } from "@/lib/utils";

export function KeyObjectives({
  goal,
  isAdmin,
  isSaving,
  onToggleObjective,
}: {
  goal: YearlyGoal | null;
  isAdmin: boolean;
  isSaving: boolean;
  onToggleObjective: (id: string, completed: boolean) => void;
}) {
  const completedCount =
    goal?.objectives.filter(o => o.isCompleted).length ?? 0;
  const totalObjectives = goal?.objectives.length ?? 0;
  const objectivePercent = totalObjectives
    ? Math.round((completedCount / totalObjectives) * 100)
    : 0;
  return (
    <div className="h-full min-w-0 rounded-2xl border border-border/70 bg-card px-5 py-5 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-[var(--accent-color-soft)] p-2 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
            <ClipboardList className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Key Objectives</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Priority outcomes that support the annual goal.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
                className="stroke-[var(--accent-color)]"
                strokeWidth="3"
                pathLength="100"
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

      {totalObjectives === 0 && (
        <p className="py-6 text-sm text-muted-foreground">
          No objectives yet. Edit the annual goal to add your priorities.
        </p>
      )}
      <ul className="divide-y divide-border/60 border-t border-border/60">
        {goal?.objectives.map(objective => (
          <li
            key={objective.id}
            className={cn(
              "flex items-start gap-3 rounded-lg px-2 py-4 -mx-2 transition-colors",
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
                aria-label={objective.text}
                className="mt-0.5 data-[state=checked]:bg-[var(--accent-color)] data-[state=checked]:border-[var(--accent-color)] data-[state=checked]:text-[var(--accent-color-foreground)]"
              />
            ) : (
              <span
                className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  objective.isCompleted
                    ? "bg-[var(--accent-color)]"
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
  );
}
