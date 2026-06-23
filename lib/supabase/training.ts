import type { SupabaseClient } from "@supabase/supabase-js";

export type TrainingCategory =
  | "Ministry"
  | "Life Skills"
  | "Leadership"
  | "Safety"
  | "Administration"
  | "Worship";

export type CourseProgressStatus = "in_progress" | "completed";

export type TrainingCourse = {
  id: string;
  name: string;
  description: string;
  category: TrainingCategory;
  slug: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
};

export type TrainingCourseModule = {
  id: string;
  courseId: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type PersonCourseProgress = {
  id: string;
  courseId: string;
  personId: string;
  status: CourseProgressStatus;
  completedModuleIds: string[];
  mondayMissionAction: string;
  enrolledDate: string;
  completedAt: string | null;
};

export type TrainingBadge = {
  progressId: string;
  courseId: string;
  courseName: string;
  category: TrainingCategory;
  earnedAt: string;
};

export const CELL_LEADERSHIP_COURSE_SLUG = "cell-leadership-101";

type DbTrainingCourse = {
  id: string;
  name: string;
  description: string;
  category: TrainingCategory;
  slug: string;
  sort_order: number;
  is_default: boolean;
  is_active: boolean;
};

type DbTrainingCourseModule = {
  id: string;
  course_id: string;
  name: string;
  description: string;
  sort_order: number;
};

type DbPersonCourseProgress = {
  id: string;
  course_id: string;
  person_id: string;
  status: CourseProgressStatus;
  completed_module_ids: string[];
  monday_mission_action: string;
  enrolled_date: string;
  completed_at: string | null;
};

function toCourse(row: DbTrainingCourse): TrainingCourse {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    slug: row.slug,
    sortOrder: row.sort_order,
    isDefault: row.is_default,
    isActive: row.is_active,
  };
}

function toModule(row: DbTrainingCourseModule): TrainingCourseModule {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function toProgress(row: DbPersonCourseProgress): PersonCourseProgress {
  return {
    id: row.id,
    courseId: row.course_id,
    personId: row.person_id,
    status: row.status,
    completedModuleIds: row.completed_module_ids ?? [],
    mondayMissionAction: row.monday_mission_action,
    enrolledDate: row.enrolled_date,
    completedAt: row.completed_at,
  };
}

export async function ensureDefaultTrainingCourses(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<void> {
  const { error } = await supabase.rpc("seed_default_training_courses", {
    org_id: organizationId,
  });
  if (error) throw error;
}

export async function fetchTrainingCourses(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TrainingCourse[]> {
  await ensureDefaultTrainingCourses(supabase, organizationId);

  const { data, error } = await supabase
    .from("training_courses")
    .select(
      "id, name, description, category, slug, sort_order, is_default, is_active",
    )
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as DbTrainingCourse[]).map(toCourse);
}

export async function fetchCourseModules(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<TrainingCourseModule[]> {
  const { data, error } = await supabase
    .from("training_course_modules")
    .select(
      "id, course_id, name, description, sort_order, training_courses!inner(organization_id, is_active)",
    )
    .eq("training_courses.organization_id", organizationId)
    .eq("training_courses.is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data as DbTrainingCourseModule[]).map(toModule);
}

export async function fetchPersonCourseProgress(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<PersonCourseProgress[]> {
  const { data, error } = await supabase
    .from("person_course_progress")
    .select(
      "id, course_id, person_id, status, completed_module_ids, monday_mission_action, enrolled_date, completed_at, training_courses!inner(organization_id, is_active)",
    )
    .eq("training_courses.organization_id", organizationId)
    .eq("training_courses.is_active", true);

  if (error) throw error;
  return (data as DbPersonCourseProgress[]).map(toProgress);
}

export type CreateTrainingCourseInput = {
  name: string;
  description?: string;
  category: TrainingCategory;
  slug: string;
};

export type UpdateTrainingCourseInput = {
  courseId: string;
  name?: string;
  description?: string;
};

export async function updateTrainingCourse(
  supabase: SupabaseClient,
  input: UpdateTrainingCourseInput,
): Promise<TrainingCourse> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) {
    payload.description = input.description.trim();
  }

  const { data, error } = await supabase
    .from("training_courses")
    .update(payload)
    .eq("id", input.courseId)
    .select(
      "id, name, description, category, slug, sort_order, is_default, is_active",
    )
    .single();

  if (error) throw error;
  return toCourse(data as DbTrainingCourse);
}

export async function deleteTrainingCourse(
  supabase: SupabaseClient,
  courseId: string,
): Promise<void> {
  const { error } = await supabase
    .from("training_courses")
    .update({ is_active: false })
    .eq("id", courseId);

  if (error) throw error;
}

export async function createTrainingCourse(
  supabase: SupabaseClient,
  organizationId: string,
  input: CreateTrainingCourseInput,
): Promise<TrainingCourse> {
  const { data, error } = await supabase
    .from("training_courses")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      category: input.category,
      slug: input.slug.trim(),
    })
    .select(
      "id, name, description, category, slug, sort_order, is_default, is_active",
    )
    .single();

  if (error) throw error;
  return toCourse(data as DbTrainingCourse);
}

export type CreateCourseModuleInput = {
  courseId: string;
  name: string;
  description?: string;
  sortOrder?: number;
};

export async function createCourseModule(
  supabase: SupabaseClient,
  input: CreateCourseModuleInput,
): Promise<TrainingCourseModule> {
  const { data, error } = await supabase
    .from("training_course_modules")
    .insert({
      course_id: input.courseId,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      sort_order: input.sortOrder ?? 0,
    })
    .select("id, course_id, name, description, sort_order")
    .single();

  if (error) throw error;
  return toModule(data as DbTrainingCourseModule);
}

export async function updateModuleSortOrder(
  supabase: SupabaseClient,
  moduleId: string,
  sortOrder: number,
): Promise<void> {
  const { error } = await supabase
    .from("training_course_modules")
    .update({ sort_order: sortOrder })
    .eq("id", moduleId);

  if (error) throw error;
}

export async function deleteCourseModule(
  supabase: SupabaseClient,
  moduleId: string,
): Promise<void> {
  const { error } = await supabase
    .from("training_course_modules")
    .delete()
    .eq("id", moduleId);

  if (error) throw error;
}

export type EnrollInCourseInput = {
  courseId: string;
  personId: string;
};

export async function enrollInCourse(
  supabase: SupabaseClient,
  input: EnrollInCourseInput,
): Promise<PersonCourseProgress> {
  const { data, error } = await supabase
    .from("person_course_progress")
    .insert({
      course_id: input.courseId,
      person_id: input.personId,
    })
    .select(
      "id, course_id, person_id, status, completed_module_ids, monday_mission_action, enrolled_date, completed_at",
    )
    .single();

  if (error) throw error;
  return toProgress(data as DbPersonCourseProgress);
}

export async function removeCourseEnrollment(
  supabase: SupabaseClient,
  progressId: string,
): Promise<void> {
  const { error } = await supabase
    .from("person_course_progress")
    .delete()
    .eq("id", progressId);

  if (error) throw error;
}

export type UpdateCourseModuleProgressInput = {
  progressId: string;
  moduleId: string;
  mondayMissionAction?: string;
};

export async function updateCourseModuleProgress(
  supabase: SupabaseClient,
  organizationId: string,
  input: UpdateCourseModuleProgressInput,
): Promise<PersonCourseProgress> {
  const [progressResult, modulesResult] = await Promise.all([
    supabase
      .from("person_course_progress")
      .select(
        "id, course_id, person_id, status, completed_module_ids, monday_mission_action, enrolled_date, completed_at, training_courses!inner(organization_id)",
      )
      .eq("id", input.progressId)
      .eq("training_courses.organization_id", organizationId)
      .single(),
    fetchCourseModules(supabase, organizationId),
  ]);

  if (progressResult.error) throw progressResult.error;

  const progress = toProgress(progressResult.data as DbPersonCourseProgress);
  const courseModules = modulesResult
    .filter(m => m.courseId === progress.courseId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (progress.status === "completed") {
    throw new Error("Course is already completed");
  }

  const completedSet = new Set(progress.completedModuleIds);
  if (completedSet.has(input.moduleId)) {
    throw new Error("Module is already completed");
  }

  const nextModule = courseModules.find(m => !completedSet.has(m.id));
  if (!nextModule || nextModule.id !== input.moduleId) {
    throw new Error("Modules must be completed in sequential order");
  }

  const newCompletedIds = [...progress.completedModuleIds, input.moduleId];
  const allComplete =
    courseModules.length > 0 &&
    courseModules.every(m => newCompletedIds.includes(m.id));

  const updatePayload: Record<string, unknown> = {
    completed_module_ids: newCompletedIds,
    status: allComplete ? "completed" : "in_progress",
    completed_at: allComplete ? new Date().toISOString() : null,
  };

  if (input.mondayMissionAction !== undefined) {
    updatePayload.monday_mission_action = input.mondayMissionAction.trim();
  }

  const { data, error } = await supabase
    .from("person_course_progress")
    .update(updatePayload)
    .eq("id", input.progressId)
    .select(
      "id, course_id, person_id, status, completed_module_ids, monday_mission_action, enrolled_date, completed_at",
    )
    .single();

  if (error) throw error;
  return toProgress(data as DbPersonCourseProgress);
}

export async function assertCellLeaderTrainingComplete(
  supabase: SupabaseClient,
  organizationId: string,
  personId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("person_course_progress")
    .select(
      "status, training_courses!inner(organization_id, slug)",
    )
    .eq("person_id", personId)
    .eq("training_courses.organization_id", organizationId)
    .eq("training_courses.slug", CELL_LEADERSHIP_COURSE_SLUG)
    .eq("status", "completed")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      "Cell Leadership 101 must be completed before assigning Cell Leader role",
    );
  }
}

export function getPersonTrainingBadges(
  personId: string,
  courses: TrainingCourse[],
  progress: PersonCourseProgress[],
): TrainingBadge[] {
  return progress
    .filter(p => p.personId === personId && p.status === "completed" && p.completedAt)
    .map(p => {
      const course = courses.find(c => c.id === p.courseId);
      return {
        progressId: p.id,
        courseId: p.courseId,
        courseName: course?.name ?? "Unknown Course",
        category: course?.category ?? "Ministry",
        earnedAt: p.completedAt!,
      };
    })
    .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
}
