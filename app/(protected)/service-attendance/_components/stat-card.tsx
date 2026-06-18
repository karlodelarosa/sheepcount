import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const variants = {
  violet: {
    card: "border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-violet-100/20 dark:from-violet-950/40 dark:to-transparent dark:border-violet-800/50",
    icon: "text-violet-600 dark:text-violet-400",
    value: "text-violet-900 dark:text-violet-100",
  },
  blue: {
    card: "border-blue-200/70 bg-gradient-to-br from-blue-50/90 to-blue-100/20 dark:from-blue-950/40 dark:to-transparent dark:border-blue-800/50",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-900 dark:text-blue-100",
  },
  emerald: {
    card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-emerald-100/20 dark:from-emerald-950/40 dark:to-transparent dark:border-emerald-800/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-900 dark:text-emerald-100",
  },
  amber: {
    card: "border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-amber-100/20 dark:from-amber-950/40 dark:to-transparent dark:border-amber-800/50",
    icon: "text-amber-600 dark:text-amber-400",
    value: "text-amber-900 dark:text-amber-100",
  },
  rose: {
    card: "border-rose-200/70 bg-gradient-to-br from-rose-50/90 to-rose-100/20 dark:from-rose-950/40 dark:to-transparent dark:border-rose-800/50",
    icon: "text-rose-600 dark:text-rose-400",
    value: "text-rose-900 dark:text-rose-100",
  },
  slate: {
    card: "border-border/60 bg-card/60",
    icon: "text-muted-foreground",
    value: "text-foreground",
  },
} as const;

export type StatCardVariant = keyof typeof variants;

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
  variant = "slate",
  className,
}: StatCardProps) {
  const styles = variants[variant];

  return (
    <Card className={cn("border", styles.card, className)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums leading-none",
                styles.value,
              )}
            >
              {value}
            </p>
            {hint ? (
              <p className="text-[11px] text-muted-foreground pt-1 truncate">
                {hint}
              </p>
            ) : null}
          </div>
          {Icon ? (
            <div
              className={cn(
                "shrink-0 rounded-lg bg-background/60 p-1.5 border border-border/40",
                styles.icon,
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
