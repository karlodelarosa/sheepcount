"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/60 transition-colors">
      <PersonAvatar name={person.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-slate-900 dark:text-white">
            {person.name}
          </p>
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
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {person.householdName}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
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
        className="shrink-0 text-xs"
        disabled={isSaving}
        onClick={() => onAction(person)}
      >
        {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        {action.label}
      </Button>
    </div>
  );
}
