"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  GraduationCap,
  ListChecks,
  ChevronRight,
  UserPlus,
  Users,
} from "lucide-react";
import { useTraining } from "@/lib/training";
import { AddTrainingCourseDialog } from "./_components/add-training-event-dialog";
import { EnrollTrainingDialog } from "./_components/record-training-complete-dialog";

import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import {
  CollectionToolbar,
  CollectionLoading,
} from "@/components/ui/directory-page-header/collection-toolbar";
import { DashboardMetricCard } from "@/components/dashboard-metric-card";
export function TrainingView() {
  const router = useRouter();
  const {
    courses,
    hydrated,
    getCourseModules,
    getCourseEnrollmentCount,
    progress,
  } = useTraining();
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"cards" | "list">("cards");
  const filteredCourses = courses.filter(
    course =>
      (category === "all" || course.category === category) &&
      `${course.name} ${course.description} ${course.category}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const DualModeCardClass =
    "min-w-0 rounded-2xl border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md flex h-full flex-col";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-muted text-muted-foreground";
  if (!hydrated) return <CollectionLoading />;

  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title="Training Academy"
        description="Competency-based courses with sequential modules"
        icon={GraduationCap}
        action={{
          label: "Add Course",
          icon: Plus,
          onClick: () => setIsAddCourseOpen(true),
        }}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashboardMetricCard
          icon={GraduationCap}
          label="Courses"
          value={courses.length}
        />
        <DashboardMetricCard
          icon={ListChecks}
          label="Modules"
          value={courses.reduce(
            (sum, course) => sum + getCourseModules(course.id).length,
            0,
          )}
        />
        <DashboardMetricCard
          icon={Users}
          label="Enrollments"
          value={courses.reduce(
            (sum, course) => sum + getCourseEnrollmentCount(course.id),
            0,
          )}
        />
      </div>
      <CollectionToolbar
        label="training courses"
        search={search}
        onSearch={setSearch}
        filter={category}
        onFilter={setCategory}
        options={[
          { value: "all", label: "All categories" },
          ...Array.from(new Set(courses.map(course => course.category))).map(
            value => ({ value, label: value }),
          ),
        ]}
        count={filteredCourses.length}
        view={view}
        onView={setView}
      />
      <p className="text-sm text-muted-foreground">
        Open a course to manage sequential modules, enroll people, and track
        completion badges.
      </p>
      <div
        className={
          view === "cards"
            ? "grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3"
            : "grid grid-cols-1 gap-5"
        }
      >
        {filteredCourses.map(course => {
          const modules = getCourseModules(course.id);
          const enrollments = getCourseEnrollmentCount(course.id);
          const completedCount = progress.filter(
            p => p.courseId === course.id && p.status === "completed",
          ).length;

          return (
            <Card key={course.id} className={DualModeCardClass}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="size-12 shrink-0 rounded-xl bg-[var(--accent-color-soft)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)] flex items-center justify-center">
                    <GraduationCap className="size-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={DualModeSecondaryBadgeClass}
                    >
                      {course.category}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <CardTitle className="break-words text-foreground">
                  <button
                    className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
                    onClick={() => router.push(`/training/${course.id}`)}
                  >
                    {course.name}
                  </button>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-zinc-400">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                  <ListChecks className="w-4 h-4" />
                  <span>
                    {modules.length} module{modules.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-zinc-500">
                      Enrolled
                    </p>
                    <p className="break-words text-foreground">
                      {enrollments} · {completedCount} completed
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedCourseId(course.id);
                      setIsEnrollDialogOpen(true);
                    }}
                    className="min-h-11 gap-2 rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Enroll
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-zinc-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
          <p>
            {courses.length
              ? "No courses match your filters"
              : "No training courses yet"}
          </p>
        </div>
      )}

      <AddTrainingCourseDialog
        open={isAddCourseOpen}
        onOpenChange={setIsAddCourseOpen}
      />

      <EnrollTrainingDialog
        open={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        courseId={selectedCourseId}
      />
    </div>
  );
}
