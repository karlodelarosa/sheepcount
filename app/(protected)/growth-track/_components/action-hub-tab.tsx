"use client";

import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
} from "@/app/(protected)/people/_components/person-detail-ui";
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
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 dark:border-zinc-700/80 dark:bg-zinc-800/30">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-lg bg-white border border-slate-200/80 p-2 dark:bg-zinc-900 dark:border-zinc-600/80">
            <Icon className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {config.label}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
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
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-zinc-400 px-1">
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
    </div>
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
    <div className="space-y-4">
      {/* Section filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {ACTION_SECTIONS.map(section => {
          const count = sectionCounts[section.key];
          const isActive = activeSection === section.key;
          const Icon = section.icon;

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onSectionChange(section.key)}
              className={cn(
                "inline-flex items-center gap-2 shrink-0 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-violet-300 bg-violet-50 text-violet-900 shadow-sm dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-100"
                  : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{section.shortLabel}</span>
              {count > 0 && (
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    "h-5 min-w-5 px-1.5 text-[10px] tabular-nums",
                    !isActive && count > 0 && "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
                  )}
                >
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <SectionContent
        config={activeConfig}
        people={sectionPeople}
        isSaving={isSaving}
        onPersonAction={onPersonAction}
      />
    </div>
  );
}
