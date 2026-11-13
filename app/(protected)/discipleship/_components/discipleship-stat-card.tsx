"use client";

import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import { type DiscipleshipAccent } from "../_lib/discipleship-themes";

export function DiscipleshipStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  accent: DiscipleshipAccent;
  className?: string;
  featured?: boolean;
}) {
  return (
    <DashboardMetricCard
      icon={Icon}
      label={label}
      value={value}
      hint={subtext}
      className={className}
    />
  );
}
