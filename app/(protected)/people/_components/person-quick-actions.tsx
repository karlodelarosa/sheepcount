"use client";

import {
  Home,
  Network,
  Sparkles,
  UserRoundPlus,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { panelCard, SectionHeader } from "./person-detail-ui";

type QuickAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

type PersonQuickActionsProps = {
  onChangeMembership: () => void;
  onAssignHousehold: () => void;
  onAssignMinistry: () => void;
  onOpenGrowth: () => void;
};

export function PersonQuickActions({
  onChangeMembership,
  onAssignHousehold,
  onAssignMinistry,
  onOpenGrowth,
}: PersonQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      label: "Change membership",
      icon: Sparkles,
      onClick: onChangeMembership,
    },
    {
      label: "Assign household",
      icon: Home,
      onClick: onAssignHousehold,
    },
    {
      label: "Assign ministry",
      icon: UserRoundPlus,
      onClick: onAssignMinistry,
    },
    { label: "Open growth", icon: Network, onClick: onOpenGrowth },
  ];

  return (
    <section className={cn(panelCard, "p-4")} aria-label="Quick actions">
      <SectionHeader
        icon={Zap}
        title="Quick Actions"
        description="Common profile updates"
      />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {actions.map(action => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-4 text-center text-sm font-medium text-foreground shadow-sm outline-none transition-[border-color,background-color,transform] hover:border-[var(--accent-color-border)] hover:bg-[var(--accent-color-soft)] focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] active:translate-y-px motion-reduce:transition-none"
          >
            <action.icon
              className="size-5 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
              aria-hidden="true"
            />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
