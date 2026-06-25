"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Accent = "purple" | "blue" | "emerald" | "orange";

export function FundraisingStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
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
  accent: Accent;
  progress?: number;
  onEdit?: () => void;
  showEdit?: boolean;
  editLabel?: string;
  className?: string;
}) {
  const accentStyles = {
    purple: {
      icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
      border: "border-purple-200/60 dark:border-purple-800/40",
      bg: "from-purple-50/80 to-white dark:from-purple-950/20 dark:to-card",
    },
    blue: {
      icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
      border: "border-blue-200/60 dark:border-blue-800/40",
      bg: "from-blue-50/80 to-white dark:from-blue-950/20 dark:to-card",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      border: "border-emerald-200/60 dark:border-emerald-800/40",
      bg: "from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-card",
    },
    orange: {
      icon: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
      border: "border-orange-200/60 dark:border-orange-800/40",
      bg: "from-orange-50/80 to-white dark:from-orange-950/20 dark:to-card",
    },
  }[accent];

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-4 transition-shadow hover:shadow-sm",
        accentStyles.border,
        accentStyles.bg,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("rounded-lg p-2 shrink-0", accentStyles.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {showEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 -mt-1 -mr-1 shrink-0 text-xs"
                onClick={onEdit}
              >
                {editLabel ?? "Edit"}
              </Button>
            )}
          </div>
          <p className="text-lg font-semibold text-foreground mt-0.5 line-clamp-2 leading-snug">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {subtext}
            </p>
          )}
          {progress !== undefined && (
            <Progress value={progress} className="h-1.5 mt-2.5" />
          )}
        </div>
      </div>
    </div>
  );
}

