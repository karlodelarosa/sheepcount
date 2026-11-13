import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DirectoryTitleAction = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
};

export type DirectoryTitleCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  actionContent?: ReactNode;
  action?: DirectoryTitleAction;
  secondaryAction?: DirectoryTitleAction;
};

export type DirectorySummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export type DirectorySummaryStripProps = {
  ariaLabel: string;
  items: DirectorySummaryItem[];
  columns: 3 | 4;
};

export function DirectoryTitleCard({
  title,
  description,
  icon: Icon,
  action,
  actionContent,
  secondaryAction,
}: DirectoryTitleCardProps) {
  const ActionIcon = action?.icon;
  const SecondaryIcon = secondaryAction?.icon;

  return (
    <header className="relative overflow-hidden border-b border-border/60 bg-card/40 px-1 pb-6 pt-2 lg:pb-4 sm:px-1">
      <div className="pointer-events-none absolute -bottom-32 right-12 h-40 w-96 rounded-[50%] bg-[var(--accent-color-soft)] opacity-60" />
      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4 lg:gap-3">
          <span className="flex size-16 lg:size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
            <Icon className="size-7 lg:size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl lg:text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base lg:text-sm">
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actionContent}
          {secondaryAction && (
            <Button
              type="button"
              variant="outline"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              className="min-h-11 lg:min-h-9 gap-2 rounded-xl bg-card px-5 shadow-sm"
            >
              {SecondaryIcon && (
                <SecondaryIcon className="size-4" aria-hidden="true" />
              )}
              {secondaryAction.label}
            </Button>
          )}
          {action ? (
            <Button
              type="button"
              variant="accent"
              onClick={action.onClick}
              disabled={action.disabled}
              className="min-h-11 lg:min-h-9 shrink-0 gap-2 rounded-xl px-5 shadow-sm"
            >
              {ActionIcon ? (
                <ActionIcon className="size-4" aria-hidden="true" />
              ) : null}
              {action.label}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function DirectorySummaryStrip({
  ariaLabel,
  items,
  columns,
}: DirectorySummaryStripProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "grid grid-cols-1 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm [&>*+*]:border-t [&>*]:border-border/70",
        columns === 3 &&
          "sm:grid-cols-3 sm:[&>*+*]:border-l sm:[&>*+*]:border-t-0",
        columns === 4 &&
          "sm:grid-cols-2 sm:[&>*:nth-child(2)]:border-l sm:[&>*:nth-child(2)]:border-t-0 sm:[&>*:nth-child(4)]:border-l lg:grid-cols-4 lg:[&>*+*]:border-l lg:[&>*+*]:border-t-0",
      )}
    >
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex min-h-20 items-center gap-3 px-4 py-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold tabular-nums text-foreground">
                {item.value}
              </p>
              <p className="truncate text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
