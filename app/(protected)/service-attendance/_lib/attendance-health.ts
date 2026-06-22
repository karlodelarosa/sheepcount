import {
  classifyAttendeeStatus,
  type AttendanceStatusKey,
} from "./attendance-breakdown";
import type { DashboardAttendeeSummary } from "./group-attendance";

export type HealthSeverity = "good" | "warning" | "action";

export type HealthInsight = {
  id: string;
  severity: HealthSeverity;
  title: string;
  detail: string;
  action: string;
};

export type AttendanceHealthResult = {
  score: number;
  insights: HealthInsight[];
  composition: Record<AttendanceStatusKey, number>;
  totalPeople: number;
};

const EMPTY_COMPOSITION: Record<AttendanceStatusKey, number> = {
  Worker: 0,
  Volunteer: 0,
  Member: 0,
  Attender: 0,
  "New Comer": 0,
  Visitor: 0,
};

function countComposition(summaries: DashboardAttendeeSummary[]) {
  const composition = { ...EMPTY_COMPOSITION };
  for (const person of summaries) {
    composition[classifyAttendeeStatus(person)]++;
  }
  return composition;
}

export function assessAttendanceHealth(
  summaries: DashboardAttendeeSummary[],
): AttendanceHealthResult {
  const total = summaries.length;
  if (total === 0) {
    return {
      score: 0,
      insights: [],
      composition: { ...EMPTY_COMPOSITION },
      totalPeople: 0,
    };
  }

  const composition = countComposition(summaries);
  const workers = composition.Worker + composition.Volunteer;
  const newcomers = composition["New Comer"];
  const visitors = composition.Visitor;
  const guests = newcomers + visitors;
  const members = composition.Member;
  const attenders = composition.Attender;

  const insights: HealthInsight[] = [];
  let score = 100;

  const workerOnly = workers === total;
  const guestOnly = guests === total;
  const noWorkers = workers === 0;
  const noGuests = guests === 0;
  const noMembers = members === 0;
  const workerHeavy = workers / total >= 0.75;
  const guestHeavy = guests / total >= 0.5;

  if (workerOnly) {
    score -= 35;
    insights.push({
      id: "worker-only",
      severity: "action",
      title: "Serving team only",
      detail: "Everyone who attended is a worker or volunteer.",
      action: "Plan outreach or invite-a-friend Sunday to bring new faces.",
    });
  }

  if (guestOnly) {
    score -= 30;
    insights.push({
      id: "guest-only",
      severity: "action",
      title: "All newcomers & visitors",
      detail: "No workers, members, or regular attenders were present.",
      action: "Assign a greeting team and follow-up owners before the next service.",
    });
  }

  if (noWorkers && total >= 3 && !guestOnly) {
    score -= 25;
    insights.push({
      id: "no-workers",
      severity: "action",
      title: "No workers attended",
      detail: "Your serving team was absent from this attendance mix.",
      action: "Confirm rosters and encourage workers to model consistent presence.",
    });
  }

  if (noGuests && total >= 5) {
    score -= 15;
    insights.push({
      id: "no-guests",
      severity: "warning",
      title: "No new faces",
      detail: "No newcomers or visitors appeared in this period.",
      action: "Consider personal invites, community events, or follow-up campaigns.",
    });
  }

  if (guestHeavy && workers <= 1 && !guestOnly) {
    score -= 20;
    insights.push({
      id: "guests-few-workers",
      severity: "action",
      title: "Many guests, few workers",
      detail: `${guests} guest${guests !== 1 ? "s" : ""} with only ${workers} worker${workers !== 1 ? "s" : ""} present.`,
      action: "Strengthen the welcome team and assign follow-up within 48 hours.",
    });
  }

  if (workerHeavy && !workerOnly && guests === 0) {
    score -= 12;
    insights.push({
      id: "worker-heavy",
      severity: "warning",
      title: "Worker-heavy attendance",
      detail: "Most of your crowd is already on the serving team.",
      action: "Balance internal gatherings with guest-focused outreach.",
    });
  }

  if (noMembers && attenders >= 3 && guests === 0) {
    score -= 10;
    insights.push({
      id: "no-members",
      severity: "warning",
      title: "No members present",
      detail: "Attenders showed up but no official members were recorded.",
      action: "Start membership conversations with regular attenders.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "balanced",
      severity: "good",
      title: "Healthy mix",
      detail: "Workers, members, attenders, and guests are represented.",
      action: "Keep nurturing connections and celebrating wins with your team.",
    });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    insights,
    composition,
    totalPeople: total,
  };
}
