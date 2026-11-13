import { CircleCheckBig, Sprout, Users, UsersRound } from "lucide-react";

import { DirectorySummaryStrip } from "@/components/ui/directory-page-header";
import type { MembershipType } from "@/lib/people";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PeopleDirectorySummary } from "../_lib/directory-summary";

type DirectoryMembership = MembershipType | "all";

type PeopleDirectoryOverviewProps = {
  summary: PeopleDirectorySummary;
  activeMembership: DirectoryMembership;
  onMembershipChange: (membership: DirectoryMembership) => void;
};

export function PeopleDirectoryOverview({
  summary,
  activeMembership,
  onMembershipChange,
}: PeopleDirectoryOverviewProps) {
  const tabs: Array<{
    label: string;
    value: DirectoryMembership;
    count: number;
  }> = [
    { label: "All People", value: "all", count: summary.total },
    { label: "Members", value: "Member", count: summary.members },
    { label: "Attenders", value: "Attender", count: summary.attenders },
    { label: "Workers", value: "Worker", count: summary.workers },
    {
      label: "Volunteers",
      value: "Volunteer Worker",
      count: summary.volunteers,
    },
    { label: "Prospects", value: "Prospect", count: summary.prospects },
  ];

  return (
    <>
      <DirectorySummaryStrip
        ariaLabel="People summary"
        columns={4}
        items={[
          { label: "Total People", value: summary.total, icon: UsersRound },
          { label: "Active", value: summary.active, icon: CircleCheckBig },
          {
            label: "In Life Groups",
            value: summary.inLifeGroups,
            icon: Users,
          },
          { label: "Prospects", value: summary.prospects, icon: Sprout },
        ]}
      />

      <Tabs
        value={activeMembership}
        onValueChange={value =>
          onMembershipChange(value as DirectoryMembership)
        }
      >
        <TabsList aria-label="Filter people by membership type">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span
                className={cn(
                  "ml-1 min-w-6 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums",
                  activeMembership === tab.value &&
                    "bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]",
                )}
              >
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
