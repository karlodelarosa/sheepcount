"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { PersonAvatar } from "@/app/(protected)/people/_components/person-detail-ui";
import { getMembershipDisplayColor } from "@/lib/membership-path";
import type { GrowthTrackPerson } from "../_lib/types";
import { formatLastActive, getNextStepAction } from "../_lib/filters";

interface PersonStageCardProps {
  person: GrowthTrackPerson;
  isSaving: boolean;
  onAction: (person: GrowthTrackPerson) => void;
}

export function PersonStageCard({
  person,
  isSaving,
  onAction,
}: PersonStageCardProps) {
  const nextStep = getNextStepAction(person);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <PersonAvatar name={person.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground break-words">
            {person.name}
          </p>
          {person.householdName && (
            <p className="text-xs text-muted-foreground truncate">
              Family: {person.householdName}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          className={`rounded-md text-xs font-normal ${getMembershipDisplayColor(person.membershipType)}`}
        >
          {person.membershipType}
        </Badge>
        {person.statusNote && (
          <Badge
            variant="outline"
            className="rounded-md text-xs font-normal text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-300 dark:border-amber-700 dark:bg-amber-950/40"
          >
            {person.statusNote}
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Last Active: {formatLastActive(person.lastActive)}
      </p>

      <Button
        size="sm"
        variant={nextStep.variant}
        className={
          nextStep.variant === "outline"
            ? "min-h-10 w-full justify-between rounded-lg border-[var(--accent-color-border)] text-xs text-[var(--accent-color-strong)] hover:bg-[var(--accent-color-soft)] dark:text-[var(--accent-color)]"
            : "min-h-10 w-full justify-between rounded-lg bg-[var(--accent-color)] text-xs text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
        }
        disabled={isSaving}
        onClick={() => onAction(person)}
      >
        {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        {nextStep.label}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
