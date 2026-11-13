"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { PersonAvatar } from "@/app/(protected)/people/_components/person-detail-ui";
import { getMembershipDisplayColor } from "@/lib/membership-path";
import type { GrowthTrackPerson } from "../_lib/types";
import {
  formatLastActive,
  getActionHubAction,
  getDaysInactive,
} from "../_lib/filters";

interface ActionRowProps {
  person: GrowthTrackPerson;
  showInactivity?: boolean;
  isSaving: boolean;
  onAction: (person: GrowthTrackPerson) => void;
}

export function ActionRow({
  person,
  showInactivity = false,
  isSaving,
  onAction,
}: ActionRowProps) {
  const action = getActionHubAction(person);
  const daysInactive = getDaysInactive(person.lastActive);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-border/60 px-4 py-5 last:border-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-5 hover:bg-muted/30 transition-colors">
      <PersonAvatar name={person.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-foreground">{person.name}</p>
          <Badge variant="outline" className="rounded-md text-xs font-normal">
            {person.evangelismStage}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Badge
            className={`rounded-md text-xs font-normal ${getMembershipDisplayColor(person.membershipType)}`}
          >
            {person.membershipType}
          </Badge>
          {person.householdName && (
            <span className="text-xs text-muted-foreground">
              {person.householdName}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Last Active: {formatLastActive(person.lastActive)}
          {showInactivity && (
            <span className="text-rose-600 dark:text-rose-400 ml-2">
              · {daysInactive} days inactive
            </span>
          )}
        </p>
        {person.statusNote && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            {person.statusNote}
          </p>
        )}
      </div>
      <Button
        size="sm"
        className="col-start-2 min-h-11 justify-between gap-3 rounded-xl bg-[var(--accent-color)] text-xs text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] sm:col-start-auto"
        disabled={isSaving}
        onClick={() => onAction(person)}
      >
        {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        {action.label}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
