"use client";

import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { FundraisingCampaign } from "@/lib/supabase/goal-projects";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";

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
  const isCompleted = campaign.status === "completed";

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--accent-color-border)] bg-card shadow-sm"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, transparent, var(--accent-color-soft))",
      }}
    >
      <div className="px-5 py-6 sm:px-8 sm:py-8 text-foreground">
        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <Button
                variant="outline"
                size="icon"
                onClick={onBack}
                aria-label="Back to campaigns"
                className="shrink-0 rounded-xl border-border bg-card hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[var(--accent-color-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
                    {campaign.category}
                  </span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <Sparkles className="h-3 w-3" />
                      Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl leading-snug">
                  {campaign.title.trim() || "Untitled campaign"}
                </h1>
                {campaign.description.trim() && (
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    {campaign.description}
                  </p>
                )}
              </div>
            </div>

            <span className="rounded-xl bg-[var(--accent-color-soft)] px-4 py-3 text-xl font-bold tabular-nums text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Raised
                </p>
                <p className="break-words text-xl font-bold tabular-nums sm:text-2xl">
                  {formatCurrency(raisedAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Goal
                </p>
                <p className="break-words text-xl font-bold tabular-nums sm:text-2xl">
                  {formatCurrency(campaign.goalAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Remaining
                </p>
                <p className="break-words text-xl font-bold tabular-nums sm:text-2xl">
                  {formatCurrency(remaining, currency)}
                </p>
              </div>
            </div>

            {actions ? (
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            ) : null}
          </div>

          <div
            role="progressbar"
            aria-label="Campaign funding progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-[var(--accent-color)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
