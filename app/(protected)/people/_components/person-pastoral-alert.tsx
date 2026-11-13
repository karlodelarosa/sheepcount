"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  HeartHandshake,
  Home,
  MessageCircle,
  Phone,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  isPastoralAlertLevel,
  PASTORAL_LEVEL_STYLES,
  type PersonPastoralStatus,
  type PastoralCareLevel,
} from "../_lib/person-pastoral-status";
import { cn } from "@/lib/utils";

const LEVEL_ICONS: Record<
  PastoralCareLevel,
  ComponentType<{ className?: string }>
> = {
  needs_visit: Home,
  check_in: MessageCircle,
  needs_contact: UserPlus,
  needs_follow_up: Phone,
  new_member: HeartHandshake,
  regular: CheckCircle2,
  inactive: AlertCircle,
};

type PersonPastoralAlertProps = {
  status: PersonPastoralStatus;
  compact?: boolean;
};

export function PersonPastoralBadge({
  status,
}: {
  status: PersonPastoralStatus;
}) {
  const styles = PASTORAL_LEVEL_STYLES[status.level];
  const Icon = LEVEL_ICONS[status.level];

  return (
    <Badge
      className={cn(
        "h-6 gap-1 rounded-full border-0 px-2.5 py-0 text-xs",
        styles.badge,
      )}
    >
      <Icon className="size-3" />
      {status.label}
    </Badge>
  );
}

export function PersonPastoralAlert({
  status,
  compact = false,
}: PersonPastoralAlertProps) {
  const styles = PASTORAL_LEVEL_STYLES[status.level];
  const Icon = LEVEL_ICONS[status.level];
  const showAction = isPastoralAlertLevel(status.level);

  if (compact && status.level === "regular") {
    return null;
  }

  if (compact && status.level === "inactive") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3",
        styles.banner,
        compact
          ? "items-center"
          : "flex-col items-stretch sm:flex-row sm:items-start",
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", styles.icon)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
          {status.label}
        </p>
        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
          {status.description}
        </p>
        {!compact && (
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
            {status.suggestedAction}
          </p>
        )}
      </div>
      {showAction && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0 self-start rounded-lg bg-white/60 text-xs dark:bg-zinc-900/60"
          asChild
        >
          <Link href="/growth-track">Log outreach</Link>
        </Button>
      )}
    </div>
  );
}
