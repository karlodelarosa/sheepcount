import type { EvangelismStage, MembershipType } from "@/lib/people";

export type AssignmentStatus =
  | "assigned"
  | "unassigned"
  | "pending_placement"
  | "ready_for_leader"
  | "ready_for_discipleship";

export type FollowUpMethod =
  | "text_message"
  | "phone_call"
  | "in_person"
  | "social_media"
  | "other";

export type OutreachPriority = "contact" | "follow_up" | "visitation";

export interface GrowthTrackPerson {
  id: string;
  name: string;
  householdName?: string;
  membershipType: MembershipType;
  evangelismStage: EvangelismStage;
  lastActive: string;
  assignmentStatus: AssignmentStatus;
  statusNote?: string;
  followUpMessageSent: boolean;
  lastFollowUpAt?: string;
  outreachPriority: OutreachPriority | null;
  cellGroupId?: string;
  lifeGroupIds?: string[];
}

export interface GrowthTrackFilters {
  search: string;
  stage: EvangelismStage | "all";
  assignmentStatus: AssignmentStatus | "all";
}

export interface NextStepAction {
  label: string;
  variant: "default" | "outline" | "secondary";
  action:
    | "complete_follow_up"
    | "move_to_follow_up"
    | "assign_cell_group"
    | "assign_life_group"
    | "enroll_discipleship"
    | "log_visitation"
    | "log_contact"
    | "advance_to_worker";
}

export type ActionHubSection =
  | "assignment"
  | "discipleship"
  | "contact"
  | "visitation"
  | "outreach";

export interface ActionHubAction {
  label: string;
  section: ActionHubSection;
  action: NextStepAction["action"];
}
