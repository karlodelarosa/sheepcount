"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/80 space-y-3">
      <div className="flex items-start gap-3">
        <PersonAvatar name={person.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 dark:text-white truncate">
            {person.name}
          </p>
          {person.householdName && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
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

      <p className="text-xs text-slate-500 dark:text-zinc-400">
        Last Active: {formatLastActive(person.lastActive)}
      </p>

      <Button
        size="sm"
        variant={nextStep.variant}
        className="w-full text-xs"
        disabled={isSaving}
        onClick={() => onAction(person)}
      >
        {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        {nextStep.label}
      </Button>
    </div>
  );
}
