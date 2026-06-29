"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  type CampaignAccent,
  statAccentThemes,
} from "../_lib/campaign-themes";

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
  featured,
  variant = "default",
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
  const theme = statAccentThemes[accent];
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        isHero
          ? "border-white/10 bg-white/10 p-4 backdrop-blur-md hover:bg-white/[0.14]"
          : cn(
              "p-4 hover:-translate-y-0.5 hover:shadow-lg",
              theme.card,
              theme.glow,
            ),
        featured && "p-5 sm:p-6",
        className,
      )}
    >
      {!isHero && (
        <div
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60",
            theme.orb,
          )}
        />
      )}

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "shrink-0 rounded-xl p-2.5 shadow-sm",
            isHero
              ? "bg-white/15 text-white ring-1 ring-white/20"
              : cn("ring-1 ring-black/5 dark:ring-white/10", theme.icon),
            featured && "p-3",
          )}
        >
          <Icon className={cn("w-4 h-4", featured && "w-5 h-5")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.14em]",
                isHero ? "text-white/60" : "text-muted-foreground",
              )}
            >
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
          <p
            className={cn(
              "font-semibold mt-1 line-clamp-2 leading-snug tabular-nums",
              isHero ? "text-white" : theme.value,
              featured
                ? "text-3xl sm:text-4xl tracking-tight"
                : "text-lg",
            )}
          >
            {value}
          </p>
          {subtext && (
            <p
              className={cn(
                "text-xs mt-1 line-clamp-2",
                isHero ? "text-white/55" : "text-muted-foreground",
              )}
            >
              {subtext}
            </p>
          )}
          {progress !== undefined && (
            <Progress value={progress} className="h-1.5 mt-3" />
          )}
        </div>
      </div>
    </div>
  );
}
