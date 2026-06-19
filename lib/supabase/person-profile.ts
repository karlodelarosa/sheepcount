import type { SupabaseClient } from "@supabase/supabase-js";
import type { CellGroup, CellGroupMember } from "@/lib/supabase/cell-groups";
import type {
  DiscipleshipBadge,
  DiscipleshipEnrollment,
  DiscipleshipTrack,
} from "@/lib/supabase/discipleship";
import type { ChurchEvent, ChurchEventRegistration } from "@/lib/supabase/events";
import type { Person } from "@/lib/people";
import type {
  PersonCourseProgress,
  TrainingBadge,
  TrainingCourse,
} from "@/lib/supabase/training";
import { getPersonTrainingBadges } from "@/lib/supabase/training";
import { fetchCellGroupMembers, fetchCellGroups } from "@/lib/supabase/cell-groups";
import {
  fetchDiscipleshipEnrollments,
  fetchDiscipleshipTracks,
} from "@/lib/supabase/discipleship";
import { fetchChurchEvents, fetchEventRegistrations } from "@/lib/supabase/events";
import { fetchPeople } from "@/lib/supabase/people";
import {
  fetchCourseModules,
  fetchPersonCourseProgress,
  fetchTrainingCourses,
} from "@/lib/supabase/training";

export type PersonDiscipleshipRole = "Learner" | "Guide" | "Both" | null;

export type PersonProfileTimelineEntry = {
  date: string;
  kind: "cell" | "discipleship" | "training" | "event";
  label: string;
  detail?: string;
};

export type PersonProfileDetails = {
  cellGroup: {
    groupId: string;
    name: string;
    role: "Leader" | "Member";
  } | null;
  discipleship: {
    roles: PersonDiscipleshipRole;
    activeEnrollments: Array<{
      trackName: string;
      role: string;
      mentorName: string | null;
    }>;
    badges: DiscipleshipBadge[];
  };
  training: {
    activeCourses: Array<{ courseName: string; progressPercent: number }>;
    completedCourses: Array<{ courseName: string; completedAt: string }>;
    badges: TrainingBadge[];
  };
  events: Array<{
    eventId: string;
    title: string;
    type: string;
    startDate: string;
    roleInEvent: string;
    attendanceStatus: string;
    registeredAsChild: boolean;
  }>;
  timeline: PersonProfileTimelineEntry[];
};

export type BuildPersonProfileDeps = {
  personId: string;
  people: Person[];
  cellGroups: CellGroup[];
  cellGroupMembers: CellGroupMember[];
  discipleshipTracks: DiscipleshipTrack[];
  discipleshipEnrollments: DiscipleshipEnrollment[];
  trainingCourses: TrainingCourse[];
  courseModules: { id: string; courseId: string; sortOrder: number }[];
  courseProgress: PersonCourseProgress[];
  churchEvents: ChurchEvent[];
  eventRegistrations: ChurchEventRegistration[];
};

function getPersonName(people: Person[], personId: string | null): string | null {
  if (!personId) return null;
  const person = people.find(p => p.id === personId);
  return person?.name ?? null;
}

function getDiscipleshipRoles(
  personId: string,
  enrollments: DiscipleshipEnrollment[],
): PersonDiscipleshipRole {
  const active = enrollments.filter(
    e => e.personId === personId && e.status === "active",
  );
  const hasLearner = active.some(e => e.role === "Learner");
  const hasGuide = active.some(e => e.role === "Guide");
  if (hasLearner && hasGuide) return "Both";
  if (hasLearner) return "Learner";
  if (hasGuide) return "Guide";
  return null;
}

function getDiscipleshipBadges(
  personId: string,
  tracks: DiscipleshipTrack[],
  enrollments: DiscipleshipEnrollment[],
): DiscipleshipBadge[] {
  return enrollments
    .filter(
      e =>
        e.personId === personId &&
        e.role === "Learner" &&
        e.status === "completed" &&
        e.completedAt,
    )
    .map(e => {
      const track = tracks.find(t => t.id === e.trackId);
      return {
        enrollmentId: e.id,
        trackId: e.trackId,
        trackName: track?.name ?? "Unknown Track",
        category: track?.category ?? "Foundation",
        color: track?.color ?? "blue",
        earnedAt: e.completedAt!,
      };
    })
    .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
}

export function buildPersonProfileDetails(
  deps: BuildPersonProfileDeps,
): PersonProfileDetails {
  const { personId } = deps;

  const cellMembership = deps.cellGroupMembers.find(m => m.personId === personId);
  const cellGroup = cellMembership
    ? deps.cellGroups.find(g => g.id === cellMembership.cellGroupId)
    : undefined;

  const personEnrollments = deps.discipleshipEnrollments.filter(
    e => e.personId === personId,
  );
  const activeEnrollments = personEnrollments
    .filter(e => e.status === "active")
    .map(e => {
      const track = deps.discipleshipTracks.find(t => t.id === e.trackId);
      return {
        trackName: track?.name ?? "Unknown Track",
        role: e.role,
        mentorName: getPersonName(deps.people, e.mentorPersonId),
      };
    });

  const discipleshipBadges = getDiscipleshipBadges(
    personId,
    deps.discipleshipTracks,
    deps.discipleshipEnrollments,
  );

  const personProgress = deps.courseProgress.filter(p => p.personId === personId);
  const activeCourses = personProgress
    .filter(p => p.status === "in_progress")
    .map(p => {
      const course = deps.trainingCourses.find(c => c.id === p.courseId);
      const moduleCount = deps.courseModules.filter(m => m.courseId === p.courseId).length;
      const completed = p.completedModuleIds.length;
      const progressPercent =
        moduleCount > 0 ? Math.round((completed / moduleCount) * 100) : 0;
      return {
        courseName: course?.name ?? "Unknown Course",
        progressPercent,
      };
    });

  const completedCourses = personProgress
    .filter(p => p.status === "completed" && p.completedAt)
    .map(p => {
      const course = deps.trainingCourses.find(c => c.id === p.courseId);
      return {
        courseName: course?.name ?? "Unknown Course",
        completedAt: p.completedAt!,
      };
    })
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  const trainingBadges = getPersonTrainingBadges(
    personId,
    deps.trainingCourses,
    deps.courseProgress,
  );

  const personRegistrations = deps.eventRegistrations.filter(
    r => r.personId === personId,
  );
  const events = personRegistrations
    .map(r => {
      const event = deps.churchEvents.find(e => e.id === r.eventId);
      return {
        eventId: r.eventId,
        title: event?.title ?? "Unknown Event",
        type: event?.type ?? "Event",
        startDate: event?.startDate ?? r.registeredDate,
        roleInEvent: r.roleInEvent,
        attendanceStatus: r.attendanceStatus,
        registeredAsChild: r.parentPersonId !== null,
      };
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const timeline: PersonProfileTimelineEntry[] = [];

  if (cellGroup && cellMembership) {
    timeline.push({
      date: cellMembership.joinedDate,
      kind: "cell",
      label: `${cellGroup.name} — ${cellMembership.role === "Leader" ? "Cell Leader" : "Member"}`,
    });
  }

  for (const badge of discipleshipBadges) {
    timeline.push({
      date: badge.earnedAt.slice(0, 10),
      kind: "discipleship",
      label: `${badge.trackName} — Completed`,
      detail: badge.category,
    });
  }

  for (const course of completedCourses) {
    timeline.push({
      date: course.completedAt.slice(0, 10),
      kind: "training",
      label: `${course.courseName} — Completed`,
    });
  }

  for (const evt of events) {
    timeline.push({
      date: evt.startDate,
      kind: "event",
      label: `${evt.title} — ${evt.roleInEvent}`,
      detail: evt.type,
    });
  }

  timeline.sort((a, b) => b.date.localeCompare(a.date));

  return {
    cellGroup: cellGroup
      ? {
          groupId: cellGroup.id,
          name: cellGroup.name,
          role: cellMembership!.role,
        }
      : null,
    discipleship: {
      roles: getDiscipleshipRoles(personId, deps.discipleshipEnrollments),
      activeEnrollments,
      badges: discipleshipBadges,
    },
    training: {
      activeCourses,
      completedCourses,
      badges: trainingBadges,
    },
    events,
    timeline,
  };
}

export async function fetchPersonProfileDetails(
  supabase: SupabaseClient,
  organizationId: string,
  personId: string,
): Promise<PersonProfileDetails> {
  const [
    { people },
    cellGroups,
    cellGroupMembers,
    discipleshipTracks,
    discipleshipEnrollments,
    trainingCourses,
    courseModules,
    courseProgress,
    churchEvents,
    eventRegistrations,
  ] = await Promise.all([
    fetchPeople(supabase, organizationId),
    fetchCellGroups(supabase, organizationId),
    fetchCellGroupMembers(supabase, organizationId),
    fetchDiscipleshipTracks(supabase, organizationId),
    fetchDiscipleshipEnrollments(supabase, organizationId),
    fetchTrainingCourses(supabase, organizationId),
    fetchCourseModules(supabase, organizationId),
    fetchPersonCourseProgress(supabase, organizationId),
    fetchChurchEvents(supabase, organizationId),
    fetchEventRegistrations(supabase, organizationId),
  ]);

  return buildPersonProfileDetails({
    personId,
    people,
    cellGroups,
    cellGroupMembers,
    discipleshipTracks,
    discipleshipEnrollments,
    trainingCourses,
    courseModules,
    courseProgress,
    churchEvents,
    eventRegistrations,
  });
}
