"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FinancialSuggestion } from "../_lib/financial-overview";

const SEVERITY_STYLES = {
  good: {
    icon: CheckCircle2,
    border: "border-emerald-200 dark:border-emerald-800/60",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    text: "text-emerald-800 dark:text-emerald-300",
    iconColor: "text-emerald-600",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-amber-50/80 dark:bg-amber-950/30",
    text: "text-amber-900 dark:text-amber-200",
    iconColor: "text-amber-600",
  },
  action: {
    icon: ClipboardList,
    border: "border-rose-200 dark:border-rose-800/60",
    bg: "bg-rose-50/80 dark:bg-rose-950/30",
    text: "text-rose-900 dark:text-rose-200",
    iconColor: "text-rose-600",
  },
} as const;

interface SuggestionsStripProps {
  suggestions: FinancialSuggestion[];
  layout?: "strip" | "sidebar";
}

export function SuggestionsStrip({
  suggestions,
  layout = "strip",
}: SuggestionsStripProps) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200/80 p-4 dark:border-amber-900/50",
        layout === "sidebar"
          ? "bg-gradient-to-b from-amber-50/80 via-orange-50/30 to-transparent dark:from-amber-950/30 dark:via-orange-950/20"
          : "bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-transparent dark:from-amber-950/30 dark:via-orange-950/20",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-violet-500" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Based on your current trend
        </p>
      </div>
      <div
        className={cn(
          "grid gap-2",
          layout === "sidebar" ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        {suggestions.map(suggestion => {
          const styles = SEVERITY_STYLES[suggestion.severity];
          const Icon = styles.icon;
          return (
            <div
              key={suggestion.id}
              className={cn(
                "rounded-lg border p-3",
                styles.border,
                styles.bg,
              )}
            >
              <div className="flex items-start gap-2">
                <Icon
                  className={cn("w-4 h-4 mt-0.5 shrink-0", styles.iconColor)}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      styles.text,
                    )}
                  >
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
