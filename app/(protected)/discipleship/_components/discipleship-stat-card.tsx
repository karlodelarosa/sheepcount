"use client";

import { cn } from "@/lib/utils";
import {
  discipleshipStatAccentThemes,
  type DiscipleshipAccent,
} from "../_lib/discipleship-themes";

export function DiscipleshipStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
  className,
  featured,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  accent: DiscipleshipAccent;
  className?: string;
  featured?: boolean;
}) {
  const theme = discipleshipStatAccentThemes[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        theme.card,
        theme.glow,
        featured && "p-5 sm:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60",
          theme.orb,
        )}
      />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "shrink-0 rounded-xl p-2.5 shadow-sm ring-1 ring-black/5 dark:ring-white/10",
            theme.icon,
            featured && "p-3",
          )}
        >
          <Icon className={cn("w-4 h-4", featured && "w-5 h-5")} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "font-semibold mt-1 line-clamp-2 leading-snug tabular-nums",
              theme.value,
              featured ? "text-3xl sm:text-4xl tracking-tight" : "text-lg",
            )}
          >
            {value}
          </p>
          {subtext && (
            <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
