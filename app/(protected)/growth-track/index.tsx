"use client";

import { PageSkeleton } from "@/components/page-skeleton";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import { Kanban, ListChecks, BarChart3, TrendingUp } from "lucide-react";
import { useGrowthTrack } from "@/lib/growth-track";
import { filterGrowthTrackPeople } from "./_lib/filters";
import type { GrowthTrackFilters, GrowthTrackPerson } from "./_lib/types";
import type { EvangelismStage } from "@/lib/people";
import {
  parseActionSection,
  getActionSectionCounts,
  getPeopleForActionSection,
  type ActionHubSectionFilter,
} from "./_lib/action-sections";
import { ControlBar } from "./_components/control-bar";
import { PipelineViewTab } from "./_components/pipeline-view-tab";
import { ActionHubTab } from "./_components/action-hub-tab";
import { OverviewTab } from "./_components/overview-tab";
import { useGrowthTrackActions } from "./_components/use-growth-track-actions";

type GrowthTrackTab = "overview" | "pipeline" | "actions";

function parseTab(value: string | null): GrowthTrackTab {
  if (value === "pipeline" || value === "actions") return value;
  return "overview";
}

const DEFAULT_FILTERS: GrowthTrackFilters = {
  search: "",
  stage: "all",
  assignmentStatus: "all",
};

function buildGrowthTrackUrl(
  tab: GrowthTrackTab,
  section?: ActionHubSectionFilter,
  stage?: EvangelismStage | "all",
): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (tab === "actions" && section && section !== "all") {
    params.set("section", section);
  }
  if (tab === "pipeline" && stage && stage !== "all") {
    params.set("stage", stage);
  }
  return `/growth-track?${params.toString()}`;
}

export function GrowthTrackView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = parseTab(searchParams.get("tab"));
  const activeSection = parseActionSection(searchParams.get("section"));

  const [filters, setFilters] = useState<GrowthTrackFilters>(() => {
    const stageParam = searchParams.get("stage");
    const validStages: (EvangelismStage | "all")[] = [
      "all",
      "First-time Attendee",
      "Follow-up",
      "Small Group",
      "Discipleship",
      "Worker",
    ];
    const stage =
      stageParam && validStages.includes(stageParam as EvangelismStage)
        ? (stageParam as EvangelismStage)
        : "all";
    return { ...DEFAULT_FILTERS, stage };
  });

  const { growthPeople, overview, hydrated, isSaving } = useGrowthTrack();
  const { handlePersonAction, handleHubAction, ActionDialog } =
    useGrowthTrackActions();

  const filteredPeople = useMemo(
    () => filterGrowthTrackPeople(growthPeople, filters),
    [growthPeople, filters],
  );

  const sectionCounts = useMemo(
    () => getActionSectionCounts(filteredPeople),
    [filteredPeople],
  );

  const totalActionCount = sectionCounts.all;

  const setActiveTab = (tab: string) => {
    if (tab === "actions") {
      router.replace(buildGrowthTrackUrl("actions", activeSection), {
        scroll: false,
      });
    } else if (tab === "pipeline") {
      router.replace(
        buildGrowthTrackUrl("pipeline", undefined, filters.stage),
        { scroll: false },
      );
    } else {
      router.replace("/growth-track?tab=overview", { scroll: false });
    }
  };

  const navigateToActions = (section: ActionHubSectionFilter) => {
    router.replace(buildGrowthTrackUrl("actions", section), { scroll: false });
  };

  const navigateToPipeline = (stage?: EvangelismStage) => {
    const targetStage = stage ?? "all";
    setFilters(prev => ({ ...prev, stage: targetStage }));
    router.replace(buildGrowthTrackUrl("pipeline", undefined, targetStage), {
      scroll: false,
    });
  };

  const setActionSection = (section: ActionHubSectionFilter) => {
    router.replace(buildGrowthTrackUrl("actions", section), { scroll: false });
  };

  const onAction = (person: GrowthTrackPerson) => {
    if (activeTab === "actions") {
      void handleHubAction(person);
    } else {
      void handlePersonAction(person);
    }
  };

  const showFilters = activeTab === "pipeline" || activeTab === "actions";

  if (!hydrated) {
    return <PageSkeleton message="Loading growth track..." />;
  }

  return (
    <div className="space-y-6">
      {ActionDialog}

      <DirectoryTitleCard
        title="Growth Track"
        description="Attendance insights, pipeline progress, and actionable next steps"
        icon={TrendingUp}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList aria-label="Growth track views">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <Kanban className="w-4 h-4" />
            Pipeline View
          </TabsTrigger>
          <TabsTrigger value="actions">
            <ListChecks className="w-4 h-4" />
            Action Hub
            {totalActionCount > 0 && (
              <Badge
                variant="destructive"
                className="h-4 min-w-4 px-1 text-[9px] tabular-nums ml-0.5"
              >
                {totalActionCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {showFilters && (
          <div className="mt-4">
            <ControlBar
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={
                activeTab === "pipeline"
                  ? filteredPeople.length
                  : getPeopleForActionSection(filteredPeople, activeSection)
                      .length
              }
              context={activeTab}
            />
          </div>
        )}

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            overview={overview}
            onNavigateToActions={navigateToActions}
            onNavigateToPipeline={navigateToPipeline}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          <PipelineViewTab
            people={filteredPeople}
            isSaving={isSaving}
            onPersonAction={onAction}
          />
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <ActionHubTab
            people={filteredPeople}
            activeSection={activeSection}
            sectionCounts={sectionCounts}
            onSectionChange={setActionSection}
            isSaving={isSaving}
            onPersonAction={onAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
