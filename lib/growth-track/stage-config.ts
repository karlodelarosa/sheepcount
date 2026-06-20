import {
  UserPlus,
  Phone,
  Users,
  BookOpen,
  Award,
} from "lucide-react";
import type { EvangelismStage } from "@/lib/people";

export const GROWTH_TRACK_STAGES = [
  {
    key: "First-time Attendee" as const,
    subtext: "New visitors",
    icon: UserPlus,
    headerBg: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    columnBorder: "border-sky-200/80 dark:border-sky-800/60",
    badgeBg: "bg-sky-500",
    chartColor: "#0ea5e9",
  },
  {
    key: "Follow-up" as const,
    subtext: "Contacted after first visit",
    icon: Phone,
    headerBg: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    columnBorder: "border-orange-200/80 dark:border-orange-800/60",
    badgeBg: "bg-orange-500",
    chartColor: "#f97316",
  },
  {
    key: "Small Group" as const,
    subtext: "Placing or participating",
    icon: Users,
    headerBg: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    columnBorder: "border-cyan-200/80 dark:border-cyan-800/60",
    badgeBg: "bg-cyan-500",
    chartColor: "#06b6d4",
  },
  {
    key: "Discipleship" as const,
    subtext: "Enrolled in programs",
    icon: BookOpen,
    headerBg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    columnBorder: "border-indigo-200/80 dark:border-indigo-800/60",
    badgeBg: "bg-indigo-500",
    chartColor: "#6366f1",
  },
  {
    key: "Worker" as const,
    subtext: "Active in ministry",
    icon: Award,
    headerBg: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    columnBorder: "border-purple-200/80 dark:border-purple-800/60",
    badgeBg: "bg-purple-500",
    chartColor: "#a855f7",
  },
] as const;

export type GrowthTrackStageKey = (typeof GROWTH_TRACK_STAGES)[number]["key"];

export const STAGE_ORDER: EvangelismStage[] = GROWTH_TRACK_STAGES.map(
  s => s.key,
);

export function getStageConfig(stage: EvangelismStage) {
  return GROWTH_TRACK_STAGES.find(s => s.key === stage);
}
