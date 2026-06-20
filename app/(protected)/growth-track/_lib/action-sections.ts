import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpen,
  LayoutList,
  MessageSquare,
  Phone,
  Users,
} from "lucide-react";
import type { GrowthTrackPerson } from "./types";
import {
  getAtRiskPeople,
  getNeedsContactPeople,
  getNeedsFollowUpPeople,
  getPendingAssignmentPeople,
  getReadyForDiscipleshipPeople,
} from "./filters";

export type ActionHubSectionFilter =
  | "all"
  | "contact"
  | "follow_up"
  | "assignment"
  | "discipleship"
  | "at_risk";

export function parseActionSection(
  value: string | null,
): ActionHubSectionFilter {
  if (
    value === "contact" ||
    value === "follow_up" ||
    value === "assignment" ||
    value === "discipleship" ||
    value === "at_risk"
  ) {
    return value;
  }
  return "all";
}

export type ActionSectionConfig = {
  key: ActionHubSectionFilter;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  showInactivity?: boolean;
  variant: "rose" | "amber" | "violet" | "blue" | "orange";
};

export const ACTION_SECTIONS: ActionSectionConfig[] = [
  {
    key: "all",
    label: "All Actions",
    shortLabel: "All",
    description: "Everyone who needs a next step",
    icon: LayoutList,
    emptyTitle: "Nothing pending",
    emptyDescription: "No one needs action right now.",
    variant: "violet",
  },
  {
    key: "contact",
    label: "Needs Contact First",
    shortLabel: "Contact",
    description:
      "First-time attendees who haven't been contacted yet. Reach out before moving to follow-up.",
    icon: Phone,
    emptyTitle: "All first-time visitors contacted",
    emptyDescription: "Everyone in this stage has received initial contact.",
    variant: "rose",
  },
  {
    key: "follow_up",
    label: "Needs Follow-up",
    shortLabel: "Follow-up",
    description:
      "People in follow-up who haven't been contacted yet. Mark as followed up once you've reached out.",
    icon: MessageSquare,
    emptyTitle: "All follow-ups completed",
    emptyDescription: "Everyone in follow-up has been contacted.",
    variant: "amber",
  },
  {
    key: "assignment",
    label: "Pending Group/Cell Assignment",
    shortLabel: "Assignment",
    description:
      "People in Follow-up or Small Group who need placement or a designated cell leader.",
    icon: Users,
    emptyTitle: "No pending assignments",
    emptyDescription:
      "Everyone in these stages has been assigned to a cell group.",
    variant: "violet",
  },
  {
    key: "discipleship",
    label: "Ready for Discipleship",
    shortLabel: "Discipleship",
    description:
      "People stabilized in a cell group who are ready for formal discipleship tracks.",
    icon: BookOpen,
    emptyTitle: "No one ready for discipleship yet",
    emptyDescription:
      "People will appear here once they are stabilized in a cell group.",
    variant: "blue",
  },
  {
    key: "at_risk",
    label: "Urgent Outreach / At Risk",
    shortLabel: "At Risk",
    description:
      "Individuals whose last activity suggests they may be slipping away. Sorted by longest inactive time.",
    icon: AlertTriangle,
    emptyTitle: "No at-risk individuals",
    emptyDescription: "Everyone has been active within the last 90 days.",
    showInactivity: true,
    variant: "orange",
  },
];

export function getPeopleForActionSection(
  people: GrowthTrackPerson[],
  section: ActionHubSectionFilter,
): GrowthTrackPerson[] {
  switch (section) {
    case "contact":
      return getNeedsContactPeople(people);
    case "follow_up":
      return getNeedsFollowUpPeople(people);
    case "assignment":
      return getPendingAssignmentPeople(people);
    case "discipleship":
      return getReadyForDiscipleshipPeople(people);
    case "at_risk":
      return getAtRiskPeople(people);
    case "all": {
      const seen = new Set<string>();
      const combined: GrowthTrackPerson[] = [];
      for (const key of [
        "contact",
        "follow_up",
        "assignment",
        "discipleship",
        "at_risk",
      ] as const) {
        for (const person of getPeopleForActionSection(people, key)) {
          if (!seen.has(person.id)) {
            seen.add(person.id);
            combined.push(person);
          }
        }
      }
      return combined;
    }
  }
}

export function getActionSectionCounts(
  people: GrowthTrackPerson[],
): Record<ActionHubSectionFilter, number> {
  return {
    all: getPeopleForActionSection(people, "all").length,
    contact: getNeedsContactPeople(people).length,
    follow_up: getNeedsFollowUpPeople(people).length,
    assignment: getPendingAssignmentPeople(people).length,
    discipleship: getReadyForDiscipleshipPeople(people).length,
    at_risk: getAtRiskPeople(people).length,
  };
}
