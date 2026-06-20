import type { EvangelismStage } from "@/lib/people";
import type { GrowthTrackPerson } from "@/lib/growth-track/types";
import type { ServiceAttendanceRow } from "@/lib/supabase/service-attendance";
import { GROWTH_TRACK_STAGES } from "@/lib/growth-track/stage-config";
import {
  getAttendanceByServiceType,
  getSundayAttendanceTrend,
  groupAttendanceBySession,
} from "@/app/(protected)/service-attendance/_lib/group-attendance";
import { getStageCounts } from "./build-people";
import { needsCellGroupAssignment } from "./cell-group-utils";

export type AttendanceTrendPoint = {
  date: string;
  count: number;
  rawDate: string;
  average?: number;
};

export type ChartSlice = {
  name: string;
  value: number;
  fill: string;
  key?: string;
};

export type FunnelBar = {
  stage: string;
  shortLabel: string;
  count: number;
  fill: string;
  percent: number;
  widthPercent: number;
};

export type MonthlyTrendPoint = {
  month: string;
  sunday: number;
  lifeGroup: number;
  total: number;
};

export type GrowthTrackOverview = {
  stageCounts: Record<EvangelismStage, number>;
  totalInPipeline: number;
  sundayTrend: AttendanceTrendPoint[];
  trendDirection: "up" | "down" | "flat";
  trendPercent: number;
  lastSundayCount: number;
  averageSundayCount: number;
  needsContactCount: number;
  needsFollowUpCount: number;
  needsVisitationCount: number;
  pendingAssignmentCount: number;
  readyForDiscipleshipCount: number;
  recommendedActions: RecommendedAction[];
  stagePieData: ChartSlice[];
  funnelData: FunnelBar[];
  outreachPieData: ChartSlice[];
  assignmentBarData: ChartSlice[];
  membershipPieData: ChartSlice[];
  monthlyTrend: MonthlyTrendPoint[];
  serviceTypeData: ChartSlice[];
  onTrackCount: number;
};

export type RecommendedAction = {
  title: string;
  description: string;
  count: number;
  priority: "high" | "medium" | "low";
};

const OUTREACH_COLORS = {
  contact: "#ef4444",
  follow_up: "#f59e0b",
  visitation: "#f97316",
  on_track: "#22c55e",
};

const ASSIGNMENT_COLORS: Record<string, string> = {
  unassigned: "#ef4444",
  pending_placement: "#f59e0b",
  ready_for_leader: "#8b5cf6",
  ready_for_discipleship: "#06b6d4",
  assigned: "#22c55e",
};

const ASSIGNMENT_LABELS: Record<string, string> = {
  unassigned: "Unassigned",
  pending_placement: "Pending Placement",
  ready_for_leader: "Needs Leader",
  ready_for_discipleship: "Ready for D101",
  assigned: "Assigned",
};

const MEMBERSHIP_COLORS: Record<string, string> = {
  "For Evangelism": "#f97316",
  Prospect: "#eab308",
  Attender: "#22c55e",
  Member: "#3b82f6",
  "Volunteer Worker": "#8b5cf6",
  Worker: "#a855f7",
};

function computeTrendDirection(
  trend: AttendanceTrendPoint[],
): { direction: "up" | "down" | "flat"; percent: number } {
  if (trend.length < 2) {
    return { direction: "flat", percent: 0 };
  }

  const recent = trend.slice(-4);
  const prior = trend.slice(-8, -4);

  if (prior.length === 0) {
    return { direction: "flat", percent: 0 };
  }

  const recentAvg =
    recent.reduce((sum, p) => sum + p.count, 0) / recent.length;
  const priorAvg = prior.reduce((sum, p) => sum + p.count, 0) / prior.length;

  if (priorAvg === 0) {
    return { direction: recentAvg > 0 ? "up" : "flat", percent: 0 };
  }

  const percent = Math.round(((recentAvg - priorAvg) / priorAvg) * 100);

  if (percent > 5) return { direction: "up", percent };
  if (percent < -5) return { direction: "down", percent };
  return { direction: "flat", percent };
}

function buildStagePieData(
  stageCounts: Record<EvangelismStage, number>,
): ChartSlice[] {
  return GROWTH_TRACK_STAGES.map(stage => ({
    name: stage.key,
    value: stageCounts[stage.key],
    fill: stage.chartColor,
    key: stage.key,
  })).filter(d => d.value > 0);
}

function buildFunnelData(
  stageCounts: Record<EvangelismStage, number>,
  total: number,
): FunnelBar[] {
  const maxCount = Math.max(...Object.values(stageCounts), 1);

  return GROWTH_TRACK_STAGES.map(stage => {
    const count = stageCounts[stage.key];
    return {
      stage: stage.key,
      shortLabel: stage.key.replace("First-time Attendee", "First Visit"),
      count,
      fill: stage.chartColor,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      widthPercent: Math.round((count / maxCount) * 100),
    };
  });
}

function buildOutreachPieData(growthPeople: GrowthTrackPerson[]): ChartSlice[] {
  const contact = growthPeople.filter(p => p.outreachPriority === "contact").length;
  const followUp = growthPeople.filter(
    p => p.outreachPriority === "follow_up",
  ).length;
  const visitation = growthPeople.filter(
    p => p.outreachPriority === "visitation",
  ).length;
  const onTrack = growthPeople.filter(p => !p.outreachPriority).length;

  return [
    { name: "Needs Contact", value: contact, fill: OUTREACH_COLORS.contact },
    { name: "Needs Follow-up", value: followUp, fill: OUTREACH_COLORS.follow_up },
    { name: "Needs Visitation", value: visitation, fill: OUTREACH_COLORS.visitation },
    { name: "On Track", value: onTrack, fill: OUTREACH_COLORS.on_track },
  ].filter(d => d.value > 0);
}

function buildAssignmentBarData(
  growthPeople: GrowthTrackPerson[],
): ChartSlice[] {
  const counts = new Map<string, number>();

  for (const person of growthPeople) {
    counts.set(
      person.assignmentStatus,
      (counts.get(person.assignmentStatus) ?? 0) + 1,
    );
  }

  return Array.from(counts.entries())
    .map(([status, value]) => ({
      name: ASSIGNMENT_LABELS[status] ?? status,
      value,
      fill: ASSIGNMENT_COLORS[status] ?? "#94a3b8",
      key: status,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildMembershipPieData(
  growthPeople: GrowthTrackPerson[],
): ChartSlice[] {
  const counts = new Map<string, number>();

  for (const person of growthPeople) {
    counts.set(
      person.membershipType,
      (counts.get(person.membershipType) ?? 0) + 1,
    );
  }

  return Array.from(counts.entries())
    .map(([type, value]) => ({
      name: type,
      value,
      fill: MEMBERSHIP_COLORS[type] ?? "#94a3b8",
      key: type,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildMonthlyTrend(
  grouped: ReturnType<typeof groupAttendanceBySession>,
): MonthlyTrendPoint[] {
  const byMonth = new Map<
    string,
    { sunday: number; lifeGroup: number; total: number; sortKey: string }
  >();

  for (const record of grouped) {
    const date = new Date(record.date);
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const month = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    const count = record.attendees.length;

    const existing = byMonth.get(sortKey) ?? {
      sunday: 0,
      lifeGroup: 0,
      total: 0,
      sortKey,
    };

    existing.total += count;
    if (record.serviceCategory === "sunday") {
      existing.sunday += count;
    } else {
      existing.lifeGroup += count;
    }

    byMonth.set(sortKey, existing);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => ({
      month: new Date(`${data.sortKey}-01`).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      sunday: data.sunday,
      lifeGroup: data.lifeGroup,
      total: data.total,
    }));
}

function buildServiceTypeData(
  grouped: ReturnType<typeof groupAttendanceBySession>,
): ChartSlice[] {
  const breakdown = getAttendanceByServiceType(grouped);
  const palette = ["#8b5cf6", "#06b6d4", "#f97316", "#22c55e", "#ec4899"];

  return breakdown.slice(0, 6).map((item, i) => ({
    name: item.serviceType,
    value: item.totalAttendees,
    fill: palette[i % palette.length],
  }));
}

function enrichSundayTrendWithAverage(
  trend: AttendanceTrendPoint[],
  average: number,
): AttendanceTrendPoint[] {
  return trend.map(point => ({ ...point, average }));
}

export function buildGrowthTrackOverview(
  growthPeople: GrowthTrackPerson[],
  attendanceRows: ServiceAttendanceRow[],
): GrowthTrackOverview {
  const stageCounts = getStageCounts(growthPeople);
  const grouped = groupAttendanceBySession(attendanceRows);
  const sundayTrendRaw = getSundayAttendanceTrend(grouped);

  const { direction, percent } = computeTrendDirection(sundayTrendRaw);
  const lastSundayCount = sundayTrendRaw.at(-1)?.count ?? 0;
  const averageSundayCount =
    sundayTrendRaw.length > 0
      ? Math.round(
          sundayTrendRaw.reduce((sum, p) => sum + p.count, 0) /
            sundayTrendRaw.length,
        )
      : 0;

  const sundayTrend = enrichSundayTrendWithAverage(
    sundayTrendRaw,
    averageSundayCount,
  );

  const needsContactCount = growthPeople.filter(
    p => p.outreachPriority === "contact",
  ).length;
  const needsFollowUpCount = growthPeople.filter(
    p => p.outreachPriority === "follow_up",
  ).length;
  const needsVisitationCount = growthPeople.filter(
    p => p.outreachPriority === "visitation",
  ).length;
  const onTrackCount = growthPeople.filter(p => !p.outreachPriority).length;
  const pendingAssignmentCount = growthPeople.filter(
    needsCellGroupAssignment,
  ).length;
  const readyForDiscipleshipCount = growthPeople.filter(
    p => p.assignmentStatus === "ready_for_discipleship",
  ).length;

  const recommendedActions: RecommendedAction[] = [];

  if (needsContactCount > 0) {
    recommendedActions.push({
      title: "Contact first-time visitors",
      description: `${needsContactCount} first-time attendee${needsContactCount === 1 ? "" : "s"} haven't been contacted yet.`,
      count: needsContactCount,
      priority: "high",
    });
  }

  if (needsVisitationCount > 0) {
    recommendedActions.push({
      title: "Schedule visitations",
      description: `${needsVisitationCount} people haven't been active in 90+ days.`,
      count: needsVisitationCount,
      priority: "high",
    });
  }

  if (pendingAssignmentCount > 0) {
    recommendedActions.push({
      title: "Place people in cell groups",
      description: `${pendingAssignmentCount} people need cell group or leader assignment.`,
      count: pendingAssignmentCount,
      priority: "medium",
    });
  }

  if (needsFollowUpCount > 0) {
    recommendedActions.push({
      title: "Send follow-up messages",
      description: `${needsFollowUpCount} people in follow-up haven't received a message yet.`,
      count: needsFollowUpCount,
      priority: "medium",
    });
  }

  if (readyForDiscipleshipCount > 0) {
    recommendedActions.push({
      title: "Enroll in Discipleship 101",
      description: `${readyForDiscipleshipCount} people are ready for formal discipleship.`,
      count: readyForDiscipleshipCount,
      priority: "low",
    });
  }

  if (direction === "down") {
    recommendedActions.unshift({
      title: "Address declining attendance",
      description: `Sunday attendance is down ${Math.abs(percent)}% over recent weeks. Focus on retention outreach.`,
      count: 0,
      priority: "high",
    });
  }

  const totalInPipeline = growthPeople.length;

  return {
    stageCounts,
    totalInPipeline,
    sundayTrend,
    trendDirection: direction,
    trendPercent: percent,
    lastSundayCount,
    averageSundayCount,
    needsContactCount,
    needsFollowUpCount,
    needsVisitationCount,
    pendingAssignmentCount,
    readyForDiscipleshipCount,
    onTrackCount,
    recommendedActions,
    stagePieData: buildStagePieData(stageCounts),
    funnelData: buildFunnelData(stageCounts, totalInPipeline),
    outreachPieData: buildOutreachPieData(growthPeople),
    assignmentBarData: buildAssignmentBarData(growthPeople),
    membershipPieData: buildMembershipPieData(growthPeople),
    monthlyTrend: buildMonthlyTrend(grouped),
    serviceTypeData: buildServiceTypeData(grouped),
  };
}
