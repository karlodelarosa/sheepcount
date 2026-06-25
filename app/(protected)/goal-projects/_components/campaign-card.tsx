"use client";

import { FundraisingStatCard } from "./fundraising-stat-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CalendarDays, Target, TrendingUp } from "lucide-react";
import type { FundraisingCampaign } from "@/lib/supabase/goal-projects";
import { formatCurrency, parseCurrency } from "@/lib/currency";

const categoryAccent: Record<string, "blue" | "emerald" | "purple" | "orange"> =
  {
    Building: "blue",
    Missions: "emerald",
    Youth: "purple",
    Equipment: "orange",
    Other: "blue",
  };

const categoryBorder: Record<string, string> = {
  Building: "border-blue-200/60 dark:border-blue-800/40",
  Missions: "border-emerald-200/60 dark:border-emerald-800/40",
  Youth: "border-purple-200/60 dark:border-purple-800/40",
  Equipment: "border-orange-200/60 dark:border-orange-800/40",
  Other: "border-blue-200/60 dark:border-blue-800/40",
};

export function CampaignCard({
  campaign,
  raisedAmount,
  currency,
  onClick,
}: {
  campaign: FundraisingCampaign;
  raisedAmount: number;
  currency: string;
  onClick: () => void;
}) {
  const goalAmount = campaign.goalAmount;
  const progress =
    goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

  const remaining = Math.max(goalAmount - raisedAmount, 0);

  const targetDateLabel = campaign.targetDate
    ? new Date(campaign.targetDate).toLocaleDateString()
    : "No target date";

  const accent = categoryAccent[campaign.category] ?? "blue";
  const borderClass = categoryBorder[campaign.category] ?? categoryBorder.Other;
  const resolvedCurrency = parseCurrency(currency);

  return (
    <div
      className={cn(
        "group rounded-xl border overflow-hidden bg-card shadow-sm transition-all hover:shadow-md cursor-pointer",
        borderClass,
        campaign.status === "completed" && "opacity-95",
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <FundraisingStatCard
        icon={campaign.status === "completed" ? TrendingUp : Target}
        label={campaign.category}
        value={campaign.title.trim() || "Untitled campaign"}
        subtext={campaign.description.trim() || undefined}
        accent={accent}
        className="rounded-none border-0 shadow-none hover:shadow-none"
      />

      <div className="border-t border-border/50 bg-card/80 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">
            {progress.toFixed(1)}%
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            {formatCurrency(raisedAmount, resolvedCurrency)}
          </span>
          <span className="text-muted-foreground">
            of {formatCurrency(goalAmount, resolvedCurrency)}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>Target: {targetDateLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Remaining: {formatCurrency(remaining, resolvedCurrency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
