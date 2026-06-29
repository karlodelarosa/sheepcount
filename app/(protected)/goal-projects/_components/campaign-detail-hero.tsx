"use client";

import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FundraisingCampaign } from "@/lib/supabase/goal-projects";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import {
  campaignThemes,
  categoryAccent,
} from "../_lib/campaign-themes";
import { CampaignProgressRing } from "./campaign-progress-ring";

export function CampaignDetailHero({
  campaign,
  raisedAmount,
  currency,
  progress,
  remaining,
  onBack,
  actions,
}: {
  campaign: FundraisingCampaign;
  raisedAmount: number;
  currency: SupportedCurrency;
  progress: number;
  remaining: number;
  onBack: () => void;
  actions?: React.ReactNode;
}) {
  const accent = categoryAccent[campaign.category] ?? "blue";
  const theme = campaignThemes[accent];
  const isCompleted = campaign.status === "completed";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border shadow-xl",
        "border-violet-200/50 shadow-violet-200/30 dark:border-zinc-700/50 dark:shadow-slate-900/40",
      )}
    >
      <div
        className={cn(
          "relative bg-gradient-to-br px-5 py-6 sm:px-8 sm:py-8 text-white",
          theme.gradient,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl",
            theme.orb,
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full blur-2xl opacity-70",
            theme.orb,
          )}
        />

        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
                className="shrink-0 rounded-xl border-white/25 bg-white/15 text-white hover:bg-white/25 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      theme.badge,
                    )}
                  >
                    {campaign.category}
                  </span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-50 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3" />
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl leading-snug">
                  {campaign.title.trim() || "Untitled campaign"}
                </h1>
                {campaign.description.trim() && (
                  <p className="text-sm text-white/75 max-w-2xl leading-relaxed">
                    {campaign.description}
                  </p>
                )}
              </div>
            </div>

            <CampaignProgressRing
              value={progress}
              size={80}
              progressClass={theme.ring}
              trackClass={theme.ringTrack}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Raised
                </p>
                <p className="text-xl font-bold tabular-nums sm:text-2xl">
                  {formatCurrency(raisedAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Goal
                </p>
                <p className="text-xl font-bold tabular-nums sm:text-2xl">
                  {formatCurrency(campaign.goalAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Remaining
                </p>
                <p className="text-xl font-bold tabular-nums sm:text-2xl">
                  {formatCurrency(remaining, currency)}
                </p>
              </div>
            </div>

            {actions ? (
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            ) : null}
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/90 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
