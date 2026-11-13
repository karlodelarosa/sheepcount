"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import { type CampaignAccent } from "../_lib/campaign-themes";

export function FundraisingStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  progress,
  onEdit,
  showEdit,
  editLabel,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  accent: CampaignAccent;
  progress?: number;
  onEdit?: () => void;
  showEdit?: boolean;
  editLabel?: string;
  className?: string;
  featured?: boolean;
  variant?: "default" | "hero";
}) {
  return (
    <DashboardMetricCard
      icon={Icon}
      label={label}
      value={value}
      hint={subtext}
      className={className}
      action={
        showEdit && onEdit ? (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            {editLabel ?? "Edit"}
          </Button>
        ) : undefined
      }
    >
      {progress !== undefined && (
        <Progress value={progress} className="mt-3 h-1.5" />
      )}
    </DashboardMetricCard>
  );
}
