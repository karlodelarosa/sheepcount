"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useTenant } from "@/app/providers/tenant-provider";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationId } from "@/lib/supabase/tenant";
import {
  createCourseModule,
  createTrainingCourse,
  deleteCourseModule,
  enrollInCourse,
  fetchCourseModules,
  fetchPersonCourseProgress,
  fetchTrainingCourses,
  getPersonTrainingBadges,
  removeCourseEnrollment,
  updateCourseModuleProgress,
  updateModuleSortOrder,
  type CreateCourseModuleInput,
  type CreateTrainingCourseInput,
  type EnrollInCourseInput,
  type PersonCourseProgress,
  type TrainingBadge,
  type TrainingCourse,
  type TrainingCourseModule,
  type UpdateCourseModuleProgressInput,
} from "@/lib/supabase/training";

type TrainingContextValue = {
  courses: TrainingCourse[];
  modules: TrainingCourseModule[];
  progress: PersonCourseProgress[];
  hydrated: boolean;
  isSaving: boolean;
  refreshTraining: () => Promise<void>;
  addCourse: (input: CreateTrainingCourseInput) => Promise<TrainingCourse | null>;
  addModule: (input: CreateCourseModuleInput) => Promise<TrainingCourseModule | null>;
  removeModuleById: (moduleId: string) => Promise<boolean>;
  moveModule: (courseId: string, moduleId: string, direction: "up" | "down") => Promise<boolean>;
  enrollPersonInCourse: (input: EnrollInCourseInput) => Promise<PersonCourseProgress | null>;
  removeEnrollment: (progressId: string) => Promise<boolean>;
  updateModuleProgress: (
    input: Omit<UpdateCourseModuleProgressInput, "progressId"> & {
      progressId?: string;
      personId: string;
      courseId: string;
    },
  ) => Promise<PersonCourseProgress | null>;
  getCourseModules: (courseId: string) => TrainingCourseModule[];
  getCourseProgressRows: (courseId: string) => PersonCourseProgress[];
  getCourseProgress: (courseId: string, personId: string) => PersonCourseProgress | undefined;
  getCourseEnrollmentCount: (courseId: string) => number;
  getPersonActiveCourses: (personId: string) => Array<{
    progress: PersonCourseProgress;
    course: TrainingCourse | undefined;
    progressPercent: number;
  }>;
  getPersonCompletedCourses: (personId: string) => Array<{
    progress: PersonCourseProgress;
    course: TrainingCourse | undefined;
  }>;
  getPersonTrainingBadges: (personId: string) => TrainingBadge[];
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const supabase = useMemo(() => createClient(), []);
  const organizationId = getOrganizationId(tenant);

  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [modules, setModules] = useState<TrainingCourseModule[]>([]);
  const [progress, setProgress] = useState<PersonCourseProgress[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshTraining = useCallback(async () => {
    if (!organizationId) {
      setCourses([]);
      setModules([]);
      setProgress([]);
      setHydrated(!tenantLoading);
      return;
    }

    try {
      const [courseData, moduleData, progressData] = await Promise.all([
        fetchTrainingCourses(supabase, organizationId),
        fetchCourseModules(supabase, organizationId),
        fetchPersonCourseProgress(supabase, organizationId),
      ]);

      setCourses(courseData);
      setModules(moduleData);
      setProgress(progressData);
    } catch (error) {
      toast.error("Failed to load training data", {
        description: getErrorMessage(error),
      });
    } finally {
      setHydrated(true);
    }
  }, [organizationId, supabase, tenantLoading]);

  useEffect(() => {
    if (tenantLoading) return;
    void refreshTraining();
  }, [refreshTraining, tenantLoading]);

  const addCourse = useCallback(
    async (input: CreateTrainingCourseInput): Promise<TrainingCourse | null> => {
      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      setIsSaving(true);
      try {
        const course = await createTrainingCourse(supabase, organizationId, input);
        await refreshTraining();
        toast.success("Training course created", {
          description: `${course.name} was added.`,
        });
        return course;
      } catch (error) {
        toast.error("Failed to create course", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [organizationId, refreshTraining, supabase],
  );

  const addModule = useCallback(
    async (input: CreateCourseModuleInput): Promise<TrainingCourseModule | null> => {
      const courseModules = modules.filter(m => m.courseId === input.courseId);
      const nextSortOrder =
        input.sortOrder ??
        (courseModules.length > 0
          ? Math.max(...courseModules.map(m => m.sortOrder)) + 1
          : 1);

      setIsSaving(true);
      try {
        const module = await createCourseModule(supabase, {
          ...input,
          sortOrder: nextSortOrder,
        });
        await refreshTraining();
        toast.success("Module added");
        return module;
      } catch (error) {
        toast.error("Failed to add module", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [modules, refreshTraining, supabase],
  );

  const removeModuleById = useCallback(
    async (moduleId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await deleteCourseModule(supabase, moduleId);
        await refreshTraining();
        toast.success("Module removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove module", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshTraining, supabase],
  );

  const moveModule = useCallback(
    async (
      courseId: string,
      moduleId: string,
      direction: "up" | "down",
    ): Promise<boolean> => {
      const courseModules = modules
        .filter(m => m.courseId === courseId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const index = courseModules.findIndex(m => m.id === moduleId);
      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || swapIndex < 0 || swapIndex >= courseModules.length) {
        return false;
      }

      const current = courseModules[index];
      const adjacent = courseModules[swapIndex];

      setIsSaving(true);
      try {
        await Promise.all([
          updateModuleSortOrder(supabase, current.id, adjacent.sortOrder),
          updateModuleSortOrder(supabase, adjacent.id, current.sortOrder),
        ]);
        await refreshTraining();
        return true;
      } catch (error) {
        toast.error("Failed to reorder module", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [modules, refreshTraining, supabase],
  );

  const enrollPersonInCourse = useCallback(
    async (input: EnrollInCourseInput): Promise<PersonCourseProgress | null> => {
      setIsSaving(true);
      try {
        const row = await enrollInCourse(supabase, input);
        await refreshTraining();
        toast.success("Enrolled in course");
        return row;
      } catch (error) {
        toast.error("Failed to enroll in course", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshTraining, supabase],
  );

  const removeEnrollment = useCallback(
    async (progressId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        await removeCourseEnrollment(supabase, progressId);
        await refreshTraining();
        toast.success("Enrollment removed");
        return true;
      } catch (error) {
        toast.error("Failed to remove enrollment", {
          description: getErrorMessage(error),
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshTraining, supabase],
  );

  const updateModuleProgressHandler = useCallback(
    async (
      input: Omit<UpdateCourseModuleProgressInput, "progressId"> & {
        progressId?: string;
        personId: string;
        courseId: string;
      },
    ): Promise<PersonCourseProgress | null> => {
      if (!organizationId) {
        toast.error("No organization found");
        return null;
      }

      const progressRow =
        input.progressId ??
        progress.find(
          p => p.personId === input.personId && p.courseId === input.courseId,
        )?.id;

      if (!progressRow) {
        toast.error("Person is not enrolled in this course");
        return null;
      }

      setIsSaving(true);
      try {
        const wasComplete = progress.find(p => p.id === progressRow)?.status === "completed";
        const updated = await updateCourseModuleProgress(supabase, organizationId, {
          progressId: progressRow,
          moduleId: input.moduleId,
          mondayMissionAction: input.mondayMissionAction,
        });
        await refreshTraining();

        if (updated.status === "completed" && !wasComplete) {
          const course = courses.find(c => c.id === input.courseId);
          toast.success("Course completed!", {
            description: `${course?.name ?? "Course"} badge earned.`,
          });
        } else {
          toast.success("Module progress updated");
        }

        return updated;
      } catch (error) {
        toast.error("Failed to update module progress", {
          description: getErrorMessage(error),
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [courses, organizationId, progress, refreshTraining, supabase],
  );

  const getCourseModules = useCallback(
    (courseId: string) =>
      modules
        .filter(m => m.courseId === courseId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [modules],
  );

  const getCourseProgressRows = useCallback(
    (courseId: string) => progress.filter(p => p.courseId === courseId),
    [progress],
  );

  const getCourseProgress = useCallback(
    (courseId: string, personId: string) =>
      progress.find(p => p.courseId === courseId && p.personId === personId),
    [progress],
  );

  const getCourseEnrollmentCount = useCallback(
    (courseId: string) => progress.filter(p => p.courseId === courseId).length,
    [progress],
  );

  const getPersonActiveCourses = useCallback(
    (personId: string) =>
      progress
        .filter(p => p.personId === personId && p.status === "in_progress")
        .map(p => {
          const course = courses.find(c => c.id === p.courseId);
          const moduleCount = modules.filter(m => m.courseId === p.courseId).length;
          const completed = p.completedModuleIds.length;
          const progressPercent =
            moduleCount > 0 ? Math.round((completed / moduleCount) * 100) : 0;
          return { progress: p, course, progressPercent };
        }),
    [courses, modules, progress],
  );

  const getPersonCompletedCourses = useCallback(
    (personId: string) =>
      progress
        .filter(p => p.personId === personId && p.status === "completed")
        .map(p => ({
          progress: p,
          course: courses.find(c => c.id === p.courseId),
        }))
        .sort((a, b) =>
          (b.progress.completedAt ?? "").localeCompare(a.progress.completedAt ?? ""),
        ),
    [courses, progress],
  );

  const getPersonTrainingBadgesHandler = useCallback(
    (personId: string) => getPersonTrainingBadges(personId, courses, progress),
    [courses, progress],
  );

  return (
    <TrainingContext.Provider
      value={{
        courses,
        modules,
        progress,
        hydrated,
        isSaving,
        refreshTraining,
        addCourse,
        addModule,
        removeModuleById,
        moveModule,
        enrollPersonInCourse,
        removeEnrollment,
        updateModuleProgress: updateModuleProgressHandler,
        getCourseModules,
        getCourseProgressRows,
        getCourseProgress,
        getCourseEnrollmentCount,
        getPersonActiveCourses,
        getPersonCompletedCourses,
        getPersonTrainingBadges: getPersonTrainingBadgesHandler,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const ctx = useContext(TrainingContext);
  if (!ctx) {
    throw new Error("useTraining must be used within a TrainingProvider");
  }
  return ctx;
}

export type { TrainingCourse, TrainingCourseModule, PersonCourseProgress, TrainingBadge };
