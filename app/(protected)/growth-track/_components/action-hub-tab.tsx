"use client";

import { EmptyState } from "@/app/(protected)/people/_components/person-detail-ui";
import type { GrowthTrackPerson } from "../_lib/types";
import {
  ACTION_SECTIONS,
  getPeopleForActionSection,
  type ActionHubSectionFilter,
  type ActionSectionConfig,
} from "../_lib/action-sections";
import { ActionRow } from "./action-row";
import { cn } from "@/lib/utils";

interface ActionHubTabProps {
  people: GrowthTrackPerson[];
  activeSection: ActionHubSectionFilter;
  sectionCounts: Record<ActionHubSectionFilter, number>;
  onSectionChange: (section: ActionHubSectionFilter) => void;
  isSaving: boolean;
  onPersonAction: (person: GrowthTrackPerson) => void;
}

function SectionContent({
  config,
  people,
  isSaving,
  onPersonAction,
}: {
  config: ActionSectionConfig;
  people: GrowthTrackPerson[];
  isSaving: boolean;
  onPersonAction: (person: GrowthTrackPerson) => void;
}) {
  const Icon = config.icon;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-[var(--accent-color-soft)] p-2.5">
            <Icon className="size-5 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              {config.label}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {people.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={config.emptyTitle}
          description={config.emptyDescription}
        />
      ) : (
        <div>
          <p className="border-b border-border/60 px-5 py-3 text-xs text-muted-foreground">
            {people.length} {people.length === 1 ? "person" : "people"}
          </p>
          {people.map(person => (
            <ActionRow
              key={person.id}
              person={person}
              showInactivity={config.showInactivity}
              isSaving={isSaving}
              onAction={onPersonAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function ActionHubTab({
  people,
  activeSection,
  sectionCounts,
  onSectionChange,
  isSaving,
  onPersonAction,
}: ActionHubTabProps) {
  const activeConfig =
    ACTION_SECTIONS.find(s => s.key === activeSection) ?? ACTION_SECTIONS[0];
  const sectionPeople = getPeopleForActionSection(people, activeSection);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
      {/* Action category navigation */}
      <nav
        aria-label="Action categories"
        className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-card p-2 shadow-sm lg:flex-col"
      >
        {ACTION_SECTIONS.map(section => {
          const count = sectionCounts[section.key];
          const isActive = activeSection === section.key;
          const Icon = section.icon;

          return (
            <button
              key={section.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSectionChange(section.key)}
              className={cn(
                "inline-flex min-h-11 items-center gap-3 shrink-0 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]",
                isActive
                  ? "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{section.shortLabel}</span>
              <span className="ml-auto min-w-6 rounded-lg bg-muted px-2 py-0.5 text-center text-xs font-semibold tabular-nums">
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      <SectionContent
        config={activeConfig}
        people={sectionPeople}
        isSaving={isSaving}
        onPersonAction={onPersonAction}
      />
    </div>
  );
}
