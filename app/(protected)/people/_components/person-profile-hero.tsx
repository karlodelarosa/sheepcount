"use client";

import { Award, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar, panelCard, type PersonAchievementKind } from "./person-detail-ui";
import { PersonPastoralBadge, PersonPastoralAlert } from "./person-pastoral-alert";
import type { PersonPastoralStatus } from "../_lib/person-pastoral-status";
import { isPastoralAlertLevel } from "../_lib/person-pastoral-status";
import { cn } from "@/lib/utils";

type QuickStat = {
  label: string;
  value: string | number;
  hint?: string;
};

function ProfileQuickStats({ items }: { items: QuickStat[] }) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-px overflow-hidden rounded-lg shrink-0",
        "bg-slate-200/70 dark:bg-zinc-700/70",
        "sm:flex sm:gap-0 sm:divide-x sm:divide-slate-200/80 sm:dark:divide-zinc-700/80 sm:rounded-lg sm:bg-slate-100/80 sm:dark:bg-zinc-800/50",
      )}
    >
      {items.map(item => (
        <div
          key={item.label}
          className={cn(
            "bg-slate-50/90 px-2.5 py-1.5 text-center dark:bg-zinc-800/90",
            "sm:bg-transparent sm:min-w-[3.25rem] sm:px-2.5",
          )}
        >
          <p className="text-sm font-semibold tabular-nums leading-none text-slate-900 dark:text-white">
            {item.value}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5 truncate">
            {item.label}
          </p>
          {item.hint && (
            <p className="text-[9px] text-slate-400 dark:text-zinc-600 truncate hidden sm:block">
              {item.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

type PersonProfileHeroProps = {
  name: string;
  role: string;
  age: number;
  status: string;
  statusColorClass: string;
  membershipLabel: string;
  membershipColorClass: string;
  isProspect: boolean;
  isEditing: boolean;
  discipleshipBadges: Array<{
    enrollmentId: string;
    trackName: string;
    color: string;
  }>;
  trackBadgeColors: Record<string, string>;
  quickStats: QuickStat[];
  pastoralStatus: PersonPastoralStatus;
  achievement?: PersonAchievementKind;
  baptizedAt?: string | null;
  showBaptismBadge?: boolean;
};

export function PersonProfileHero({
  name,
  role,
  age,
  status,
  statusColorClass,
  membershipLabel,
  membershipColorClass,
  isProspect,
  isEditing,
  discipleshipBadges,
  trackBadgeColors,
  quickStats,
  pastoralStatus,
  achievement = null,
  baptizedAt = null,
  showBaptismBadge = false,
}: PersonProfileHeroProps) {
  const visibleBadges = discipleshipBadges.slice(0, 2);
  const extraBadgeCount = discipleshipBadges.length - visibleBadges.length;

  return (
    <div className={cn(panelCard, "overflow-hidden")}>
      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-start gap-3 min-w-0">
          <PersonAvatar name={name} size="profile" achievement={achievement} />
          <div className="flex-1 min-w-0 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight truncate">
                  {name}
                </h2>
                <span className="text-xs text-slate-500 dark:text-zinc-400 shrink-0">
                  {role} · {age} yo
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <Badge
                  className={cn(
                    "rounded-md px-1.5 py-0 text-[10px] h-5",
                    statusColorClass,
                  )}
                >
                  {status}
                </Badge>
                <Badge
                  className={cn(
                    "rounded-md px-1.5 py-0 text-[10px] h-5",
                    membershipColorClass,
                  )}
                >
                  {membershipLabel}
                </Badge>
                {!isEditing && (
                  <PersonPastoralBadge status={pastoralStatus} />
                )}
                {isProspect && (
                  <Badge className="rounded-md px-1.5 py-0 text-[10px] h-5 bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                    Prospect
                  </Badge>
                )}
                {showBaptismBadge && baptizedAt && (
                  <Badge className="rounded-md px-1.5 py-0 text-[10px] h-5 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                    <Droplets className="w-2.5 h-2.5 mr-0.5 inline" />
                    Baptized
                  </Badge>
                )}
                {visibleBadges.map(badge => (
                  <Badge
                    key={badge.enrollmentId}
                    className={cn(
                      "rounded-md border-0 px-1.5 py-0 text-[10px] h-5 bg-gradient-to-r text-white",
                      trackBadgeColors[badge.color] ?? trackBadgeColors.blue,
                    )}
                  >
                    <Award className="w-2.5 h-2.5 mr-0.5 inline" />
                    {badge.trackName}
                  </Badge>
                ))}
                {extraBadgeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-md px-1.5 py-0 text-[10px] h-5"
                  >
                    +{extraBadgeCount}
                  </Badge>
                )}
              </div>
            </div>

            {!isEditing && (
              <ProfileQuickStats items={quickStats} />
            )}
          </div>
        </div>

        {!isEditing &&
          (isPastoralAlertLevel(pastoralStatus.level) ||
            pastoralStatus.level === "new_member") && (
            <PersonPastoralAlert status={pastoralStatus} compact />
          )}
      </div>
    </div>
  );
}
