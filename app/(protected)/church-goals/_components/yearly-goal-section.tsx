"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Edit, MoreVertical, ClipboardList } from "lucide-react";
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

export function YearlyGoalSection({
  goal,
  year,
  isAdmin,
  isSaving,
  onEdit,
  onSaveRetrospective,
}: {
  goal: YearlyGoal | null;
  year: number;
  isAdmin: boolean;
  isSaving: boolean;
  onEdit: () => void;
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

  return (
    <>
      <div
        className="relative isolate overflow-hidden rounded-2xl text-white shadow-sm"
        style={{
          background:
            "linear-gradient(115deg, color-mix(in srgb, var(--accent-color) 10%, #10121b), color-mix(in srgb, var(--accent-color) 23%, #10121b) 65%, #10121b)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-64 -right-32 h-96 w-[70%] -rotate-[24deg] rounded-[50%] border border-white/5 bg-white/[0.03]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-72 right-0 h-96 w-[55%] -rotate-[35deg] rounded-[50%]"
          style={{
            background:
              "color-mix(in srgb, var(--accent-color) 13%, transparent)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative px-6 py-8 sm:px-10 sm:py-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <p className="text-sm font-medium text-white/80 tracking-wide uppercase">
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
              <p className="text-sm sm:text-base font-medium text-white tracking-wide">
                {goal.theme}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mt-1">
              {goal.title.trim() || goal.theme || `${year} Church Goal`}
            </h2>
            {goal.description && (
              <p className="mt-4 text-sm sm:text-base text-white/85 leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>

          {goal.vision && (
            <blockquote className="mt-6 border-l-2 border-[var(--accent-color)] pl-5 max-w-2xl">
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-light italic">
                {goal.vision}
              </p>
            </blockquote>
          )}
        </div>
      </div>

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
