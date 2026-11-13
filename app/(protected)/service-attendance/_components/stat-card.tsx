import type { LucideIcon } from "lucide-react";

import { DashboardMetricCard } from "@/components/dashboard-metric-card";

export type StatCardVariant =
  | "accent"
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "slate";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <DashboardMetricCard
      label={label}
      value={value}
      hint={hint}
      icon={Icon}
      className={className}
    />
  );
}
