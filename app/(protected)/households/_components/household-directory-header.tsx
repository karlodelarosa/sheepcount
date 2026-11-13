import { Home, HousePlus, Plus, UsersRound } from "lucide-react";

import {
  DirectorySummaryStrip,
  DirectoryTitleCard,
} from "@/components/ui/directory-page-header";
import type { HouseholdDirectorySummary } from "../_lib/directory";

type HouseholdDirectoryHeaderProps = {
  summary: HouseholdDirectorySummary;
  onAddHousehold: () => void;
};

export function HouseholdDirectoryHeader({
  summary,
  onAddHousehold,
}: HouseholdDirectoryHeaderProps) {
  return (
    <>
      <DirectoryTitleCard
        title="Households"
        description="Manage household information and the people who belong to them."
        icon={Home}
        action={{
          label: "Add Household",
          icon: Plus,
          onClick: onAddHousehold,
        }}
      />

      <DirectorySummaryStrip
        ariaLabel="Household summary"
        columns={3}
        items={[
          {
            label: "Households",
            value: summary.totalHouseholds,
            icon: Home,
          },
          {
            label: "Linked people",
            value: summary.linkedPeople,
            icon: UsersRound,
          },
          {
            label: "Empty households",
            value: summary.emptyHouseholds,
            icon: HousePlus,
          },
        ]}
      />
    </>
  );
}
