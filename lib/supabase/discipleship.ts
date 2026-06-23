import type { SupabaseClient } from "@supabase/supabase-js";

export type DiscipleshipCategory =
  | "Foundation"
  | "Growth"
  | "Leadership"
  | "Mentorship";

export type DiscipleshipTrackStatus = "active" | "finished";

export type DiscipleshipRole = "Learner" | "Guide";

export type DiscipleshipEnrollmentStatus = "active" | "completed" | "paused";

export type DiscipleshipTrack = {
  id: string;
  name: string;
  description: string;
  category: DiscipleshipCategory;
  duration: string;
  schedule: string;
  leaderPersonId: string | null;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  status: DiscipleshipTrackStatus;
};

export type DiscipleshipEnrollment = {
  id: string;
  trackId: string;
  personId: string;
  mentorPersonId: string | null;
  role: DiscipleshipRole;
  status: DiscipleshipEnrollmentStatus;
  enrolledDate: string;
  currentModule: string;
  completedAt: string | null;
};

export type DiscipleshipMilestone = {
  id: string;
  trackId: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type DiscipleshipMilestoneCompletion = {
  id: string;
  enrollmentId: string;
  milestoneId: string;
  completedAt: string;
  notes: string;
  completedByPersonId: string | null;
};

type DbDiscipleshipTrack = {
  id: string;
  name: string;
  description: string;
  category: DiscipleshipCategory;
  duration: string;
  schedule: string;
  leader_person_id: string | null;
  color: string;
  sort_order: number;
  is_default: boolean;
  is_active: boolean;
  status: DiscipleshipTrackStatus;
};

type DbDiscipleshipEnrollment = {
  id: string;
  track_id: string;
  person_id: string;
  mentor_person_id: string | null;
  role: DiscipleshipRole;
  status: DiscipleshipEnrollmentStatus;
  enrolled_date: string;
  current_module: string;
  completed_at: string | null;
};

type DbDiscipleshipMilestone = {
  id: string;
  track_id: string;
  name: string;
  description: string;
  sort_order: number;
};

type DbDiscipleshipMilestoneCompletion = {
  id: string;
  enrollment_id: string;
  milestone_id: string;
  completed_at: string;
  notes: string;
  completed_by_person_id: string | null;
};

function toTrack(row: DbDiscipleshipTrack): DiscipleshipTrack {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    duration: row.duration,
    schedule: row.schedule,
    leaderPersonId: row.leader_person_id,
    color: row.color,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
    isActive: row.is_active,
    status: row.status ?? "active",
  };
}

function toEnrollment(row: DbDiscipleshipEnrollment): DiscipleshipEnrollment {
  return {
    id: row.id,
    trackId: row.track_id,
    personId: row.person_id,
    mentorPersonId: row.mentor_person_id,
    role: row.role,
    status: row.status,
    enrolledDate: row.enrolled_date,
    currentModule: row.current_module,
    completedAt: row.completed_at,
  };
}

function toMilestone(row: DbDiscipleshipMilestone): DiscipleshipMilestone {
  return {
    id: row.id,
    trackId: row.track_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function toMilestoneCompletion(
  row: DbDiscipleshipMilestoneCompletion,
): DiscipleshipMilestoneCompletion {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    milestoneId: row.milestone_id,
    completedAt: row.completed_at,
    notes: row.notes,
    completedByPersonId: row.completed_by_person_id,
  };
}

export async function ensureDefaultDiscipleshipTracks(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const { error } = await supabase.rpc("seed_default_discipleship_tracks", {
    org_id: organizationId,
  });
  if (error) throw error;
}

export async function fetchDiscipleshipTracks(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DiscipleshipTrack[]> {
  await ensureDefaultDiscipleshipTracks(supabase, organizationId);

  const { data, error } = await supabase
    .from("discipleship_tracks")
    .select(
      "id, name, description, category, duration, schedule, leader_person_id, color, sort_order, is_default, is_active, status",
    )
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbDiscipleshipTrack[]).map(toTrack);
}

export async function fetchDiscipleshipEnrollments(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DiscipleshipEnrollment[]> {
  const { data, error } = await supabase
    .from("discipleship_enrollments")
    .select(
      "id, track_id, person_id, mentor_person_id, role, status, enrolled_date, current_module, completed_at, discipleship_tracks!inner(organization_id, is_active)",
    )
    .eq("discipleship_tracks.organization_id", organizationId)
    .eq("discipleship_tracks.is_active", true);

  if (error) throw error;
  return (data as DbDiscipleshipEnrollment[]).map(toEnrollment);
}

export async function fetchDiscipleshipMilestones(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DiscipleshipMilestone[]> {
  const { data, error } = await supabase
    .from("discipleship_milestones")
    .select(
      "id, track_id, name, description, sort_order, discipleship_tracks!inner(organization_id, is_active)",
    )
    .eq("discipleship_tracks.organization_id", organizationId)
    .eq("discipleship_tracks.is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data as DbDiscipleshipMilestone[]).map(toMilestone);
}

export async function fetchDiscipleshipMilestoneCompletions(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<DiscipleshipMilestoneCompletion[]> {
  const { data, error } = await supabase
    .from("discipleship_milestone_completions")
    .select(
      "id, enrollment_id, milestone_id, completed_at, notes, completed_by_person_id, discipleship_enrollments!inner(track_id, discipleship_tracks!inner(organization_id, is_active))",
    )
    .eq("discipleship_enrollments.discipleship_tracks.organization_id", organizationId)
    .eq("discipleship_enrollments.discipleship_tracks.is_active", true);

  if (error) throw error;
  return (data as DbDiscipleshipMilestoneCompletion[]).map(toMilestoneCompletion);
}

export type CreateDiscipleshipTrackInput = {
  name: string;
  description?: string;
  category: DiscipleshipCategory;
  duration?: string;
  schedule?: string;
  leaderPersonId?: string;
  color?: string;
};

export type UpdateDiscipleshipTrackInput = {
  trackId: string;
  name?: string;
  description?: string;
  category?: DiscipleshipCategory;
  status?: DiscipleshipTrackStatus;
};

export async function updateDiscipleshipTrack(
  supabase: SupabaseClient,
  input: UpdateDiscipleshipTrackInput,
): Promise<DiscipleshipTrack> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) {
    payload.description = input.description.trim();
  }
  if (input.category !== undefined) payload.category = input.category;
  if (input.status !== undefined) payload.status = input.status;

  const { data, error } = await supabase
    .from("discipleship_tracks")
    .update(payload)
    .eq("id", input.trackId)
    .select(
      "id, name, description, category, duration, schedule, leader_person_id, color, sort_order, is_default, is_active, status",
    )
    .single();

  if (error) throw error;
  return toTrack(data as DbDiscipleshipTrack);
}

export async function deleteDiscipleshipTrack(
  supabase: SupabaseClient,
  trackId: string,
): Promise<void> {
  const { error } = await supabase
    .from("discipleship_tracks")
    .update({ is_active: false })
    .eq("id", trackId);

  if (error) throw error;
}

export async function createDiscipleshipTrack(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateDiscipleshipTrackInput,
): Promise<DiscipleshipTrack> {
  const { data, error } = await supabase
    .from("discipleship_tracks")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      category: input.category,
      duration: input.duration?.trim() ?? "",
      schedule: input.schedule?.trim() ?? "",
      leader_person_id: input.leaderPersonId ?? null,
      color: input.color ?? "blue",
    })
    .select(
      "id, name, description, category, duration, schedule, leader_person_id, color, sort_order, is_default, is_active, status",
    )
    .single();

  if (error) throw error;
  return toTrack(data as DbDiscipleshipTrack);
}

export type EnrollInTrackInput = {
  trackId: string;
  personId: string;
  role?: DiscipleshipRole;
  mentorPersonId?: string;
};

export async function enrollInTrack(
  supabase: SupabaseClient,
  input: EnrollInTrackInput,
): Promise<DiscipleshipEnrollment> {
  const { data, error } = await supabase
    .from("discipleship_enrollments")
    .insert({
      track_id: input.trackId,
      person_id: input.personId,
      role: input.role ?? "Learner",
      mentor_person_id: input.mentorPersonId ?? null,
    })
    .select(
      "id, track_id, person_id, mentor_person_id, role, status, enrolled_date, current_module, completed_at",
    )
    .single();

  if (error) throw error;
  return toEnrollment(data as DbDiscipleshipEnrollment);
}

export async function removeEnrollment(
  supabase: SupabaseClient,
  enrollmentId: string,
): Promise<void> {
  const { error } = await supabase
    .from("discipleship_enrollments")
    .delete()
    .eq("id", enrollmentId);

  if (error) throw error;
}

export async function toggleMilestoneCompletion(
  supabase: SupabaseClient,
  enrollmentId: string,
  milestoneId: string,
  completedByPersonId: string | null,
  existingCompletionId?: string,
): Promise<DiscipleshipMilestoneCompletion | null> {
  if (existingCompletionId) {
    const { error } = await supabase
      .from("discipleship_milestone_completions")
      .delete()
      .eq("id", existingCompletionId);

    if (error) throw error;
    return null;
  }

  const { data, error } = await supabase
    .from("discipleship_milestone_completions")
    .insert({
      enrollment_id: enrollmentId,
      milestone_id: milestoneId,
      completed_by_person_id: completedByPersonId,
    })
    .select(
      "id, enrollment_id, milestone_id, completed_at, notes, completed_by_person_id",
    )
    .single();

  if (error) throw error;
  return toMilestoneCompletion(data as DbDiscipleshipMilestoneCompletion);
}

export type CreateMilestoneInput = {
  trackId: string;
  name: string;
  description?: string;
  sortOrder?: number;
};

export async function createMilestone(
  supabase: SupabaseClient,
  input: CreateMilestoneInput,
): Promise<DiscipleshipMilestone> {
  const { data, error } = await supabase
    .from("discipleship_milestones")
    .insert({
      track_id: input.trackId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      sort_order: input.sortOrder ?? 0,
    })
    .select("id, track_id, name, description, sort_order")
    .single();

  if (error) throw error;
  return toMilestone(data as DbDiscipleshipMilestone);
}

export async function updateMilestoneSortOrder(
  supabase: SupabaseClient,
  milestoneId: string,
  sortOrder: number,
): Promise<void> {
  const { error } = await supabase
    .from("discipleship_milestones")
    .update({ sort_order: sortOrder })
    .eq("id", milestoneId);

  if (error) throw error;
}

export type DiscipleshipBadge = {
  enrollmentId: string;
  trackId: string;
  trackName: string;
  category: DiscipleshipCategory;
  color: string;
  earnedAt: string;
};

export async function syncEnrollmentCompletion(
  supabase: SupabaseClient,
  enrollmentId: string,
  trackMilestoneIds: string[],
  completedMilestoneIds: string[],
): Promise<DiscipleshipEnrollment | null> {
  const total = trackMilestoneIds.length;
  const completed = completedMilestoneIds.length;
  const isComplete = total > 0 && completed === total;

  const { data, error } = await supabase
    .from("discipleship_enrollments")
    .update({
      status: isComplete ? "completed" : "active",
      completed_at: isComplete ? new Date().toISOString() : null,
    })
    .eq("id", enrollmentId)
    .select(
      "id, track_id, person_id, mentor_person_id, role, status, enrolled_date, current_module, completed_at",
    )
    .single();

  if (error) throw error;
  return toEnrollment(data as DbDiscipleshipEnrollment);
}

export async function deleteMilestone(
  supabase: SupabaseClient,
  milestoneId: string,
): Promise<void> {
  const { error } = await supabase
    .from("discipleship_milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) throw error;
}
