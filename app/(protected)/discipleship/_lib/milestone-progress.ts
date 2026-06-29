import type {
  DiscipleshipMilestone,
  DiscipleshipMilestoneCompletion,
} from "@/lib/supabase/discipleship";

export function getCurrentMilestone(
  enrollmentId: string,
  trackMilestones: DiscipleshipMilestone[],
  completions: DiscipleshipMilestoneCompletion[],
): DiscipleshipMilestone | null {
  if (trackMilestones.length === 0) return null;

  const completedIds = new Set(
    completions
      .filter(completion => completion.enrollmentId === enrollmentId)
      .map(completion => completion.milestoneId),
  );

  return trackMilestones.find(milestone => !completedIds.has(milestone.id)) ?? null;
}
