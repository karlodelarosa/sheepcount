"use client";

import type { LucideIcon } from "lucide-react";

import { DashboardMetricCard } from "@/components/dashboard-metric-card";

export type OverviewStatVariant =
  | "accent"
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "orange"
  | "slate";

interface OverviewStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  variant?: OverviewStatVariant;
  onClick?: () => void;
  className?: string;
}

export function OverviewStatCard({
  label,
  value,
  hint,
  icon: Icon,
  onClick,
  className,
}: OverviewStatCardProps) {
  return (
    <DashboardMetricCard
      label={label}
      value={value}
      hint={hint}
      icon={Icon}
      onClick={onClick}
      className={className}
    />
  );
}
