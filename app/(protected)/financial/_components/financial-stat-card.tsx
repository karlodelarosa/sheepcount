import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  income: {
    icon: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
  },
  expense: {
    icon: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    value: "text-rose-700 dark:text-rose-400",
  },
  giving: {
    icon: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-400",
  },
  neutral: {
    icon: "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]",
    value: "text-foreground",
  },
};

export function FinancialStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  action,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  action?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            tones[tone].icon,
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-1 break-words text-2xl font-bold tracking-tight tabular-nums",
              tones[tone].value,
            )}
          >
            {value}
          </p>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{hint}</div>
      {action && (
        <div className="mt-3 border-t border-border/60 pt-2">{action}</div>
      )}
    </div>
  );
}
