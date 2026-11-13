"use client";

import { Award, Droplets, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PersonAvatar,
  panelCard,
  type PersonAchievementKind,
} from "./person-detail-ui";
import { PersonPastoralBadge } from "./person-pastoral-alert";
import type { PersonPastoralStatus } from "../_lib/person-pastoral-status";
import { cn } from "@/lib/utils";

type QuickStat = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
};

function ProfileQuickStats({ items }: { items: QuickStat[] }) {
  return (
    <div className="grid grid-cols-2 border-t border-border/70 bg-background/75 sm:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "flex min-h-20 items-center gap-3 px-4 py-3",
            "border-border/70 odd:border-r sm:border-r sm:last:border-r-0",
            index > 1 && "border-t sm:border-t-0",
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
            <item.icon className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold tabular-nums leading-none text-foreground">
              {item.value}
            </p>
            <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
              {item.label}
            </p>
            {item.hint && (
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {item.hint}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

type PersonProfileHeroProps = {
  name: string;
  gender?: string | null;
  age: number;
  status: string;
  statusColorClass: string;
  membershipLabel: string;
  membershipColorClass: string;
  isProspect: boolean;
  cellGroupRole?: "Leader" | "Member";
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
  gender,
  age,
  status,
  statusColorClass,
  membershipLabel,
  membershipColorClass,
  isProspect,
  cellGroupRole,
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
    <section
      className={cn(panelCard, "overflow-hidden")}
      aria-label="Person summary"
    >
      <div className="relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--accent-color-soft)] via-transparent to-[var(--accent-color-soft)] opacity-70"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full bg-[var(--accent-color-soft)] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex min-w-0 items-start gap-4 sm:items-center">
          <PersonAvatar name={name} size="lg" achievement={achievement} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="truncate text-2xl font-bold leading-tight text-foreground">
                {name}
              </h2>
              <span className="shrink-0 text-sm text-muted-foreground">
                {gender || "Gender not specified"} · {age} years old
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Badge
                className={cn(
                  "h-6 rounded-full px-2.5 py-0 text-xs",
                  statusColorClass,
                )}
              >
                {status}
              </Badge>
              <Badge
                className={cn(
                  "h-6 rounded-full px-2.5 py-0 text-xs",
                  membershipColorClass,
                )}
              >
                {membershipLabel}
              </Badge>
              {!isEditing && <PersonPastoralBadge status={pastoralStatus} />}
              {isProspect && (
                <Badge className="h-6 rounded-full bg-amber-100 px-2.5 py-0 text-xs text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                  Prospect
                </Badge>
              )}
              {cellGroupRole && (
                <Badge className="h-6 rounded-full bg-teal-100 px-2.5 py-0 text-xs text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                  {cellGroupRole === "Leader"
                    ? "Cell Group Leader"
                    : "Cell Group Member"}
                </Badge>
              )}
              {showBaptismBadge && baptizedAt && (
                <Badge className="h-6 rounded-full bg-cyan-100 px-2.5 py-0 text-xs text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                  <Droplets className="mr-1 size-3 inline" />
                  Baptized
                </Badge>
              )}
              {visibleBadges.map(badge => (
                <Badge
                  key={badge.enrollmentId}
                  className={cn(
                    "h-6 rounded-full border-0 bg-gradient-to-r px-2.5 py-0 text-xs text-white",
                    trackBadgeColors[badge.color] ?? trackBadgeColors.blue,
                  )}
                >
                  <Award className="mr-1 size-3 inline" />
                  {badge.trackName}
                </Badge>
              ))}
              {extraBadgeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-6 rounded-full px-2.5 py-0 text-xs"
                >
                  +{extraBadgeCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      {!isEditing && <ProfileQuickStats items={quickStats} />}
    </section>
  );
}
