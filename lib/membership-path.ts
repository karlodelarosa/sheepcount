import type { EvangelismStage, MembershipType } from "@/lib/people";

/** The primary journey from first visit to full ministry worker. */
export const MEMBERSHIP_PATH = [
  "Attender",
  "Member",
  "Volunteer Worker",
  "Worker",
] as const;

export type MembershipPathType = (typeof MEMBERSHIP_PATH)[number];

export const MEMBERSHIP_PATH_LABELS: Record<MembershipPathType, string> = {
  Attender: "Attender",
  Member: "Member",
  "Volunteer Worker": "Volunteer",
  Worker: "Worker",
};

export const MEMBERSHIP_PATH_DESCRIPTIONS: Record<MembershipPathType, string> = {
  Attender: "Regular attendee, not yet a member",
  Member: "Official church member",
  "Volunteer Worker": "Serves in ministry as a volunteer",
  Worker: "Committed ministry worker or leader",
};

export function isMembershipPathType(
  type: MembershipType,
): type is MembershipPathType {
  return (MEMBERSHIP_PATH as readonly string[]).includes(type);
}

export function getMembershipPathIndex(type: MembershipType): number {
  const index = MEMBERSHIP_PATH.indexOf(type as MembershipPathType);
  return index === -1 ? -1 : index;
}

export function getNextMembershipPathType(
  type: MembershipType,
): MembershipPathType | null {
  if (type === "Prospect" || type === "For Evangelism") {
    return "Attender";
  }

  const index = getMembershipPathIndex(type);
  if (index === -1 || index >= MEMBERSHIP_PATH.length - 1) return null;
  return MEMBERSHIP_PATH[index + 1];
}

export function evangelismStageForMembershipType(
  type: MembershipPathType,
): EvangelismStage {
  switch (type) {
    case "Attender":
      return "Follow-up";
    case "Member":
      return "Discipleship";
    case "Volunteer Worker":
    case "Worker":
      return "Worker";
  }
}

export function getMembershipColor(type: string): string {
  switch (type) {
    case "Worker":
      return "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300";
    case "Volunteer Worker":
      return "bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-300";
    case "Member":
      return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
    case "Attender":
      return "bg-green-100 text-green-700 dark:bg-emerald-800 dark:text-emerald-300";
    case "New Comer":
      return "bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-300";
    case "Prospect":
      return "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300";
    case "For Evangelism":
      return "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  }
}

const NEWCOMER_PERIOD_DAYS = 30;

/** Attenders within their first calendar month are shown as "New Comer". */
export function isAttenderNewComer(joinDate: string): boolean {
  if (!joinDate) return false;
  const joined = new Date(joinDate);
  if (Number.isNaN(joined.getTime())) return false;

  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceJoin = Math.floor(
    (today.getTime() - joined.getTime()) / msPerDay,
  );
  return daysSinceJoin >= 0 && daysSinceJoin < NEWCOMER_PERIOD_DAYS;
}

export function getMembershipDisplayLabel(
  membershipType: string,
  joinDate?: string,
): string {
  if (
    membershipType === "Attender" &&
    joinDate &&
    isAttenderNewComer(joinDate)
  ) {
    return "New Comer";
  }
  if (membershipType === "Volunteer Worker") return "Volunteer";
  return membershipType;
}

export function getMembershipDisplayColor(
  membershipType: string,
  joinDate?: string,
): string {
  const label = getMembershipDisplayLabel(membershipType, joinDate);
  return getMembershipColor(label);
}
