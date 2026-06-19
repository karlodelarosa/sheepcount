"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, GraduationCap, ListChecks, ChevronRight, Info, UserPlus } from "lucide-react";
import { useTraining } from "@/lib/training";
import { AddTrainingCourseDialog } from "./_components/add-training-event-dialog";
import { EnrollTrainingDialog } from "./_components/record-training-complete-dialog";

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

  const categoryColors: Record<string, string> = {
    Leadership: "from-purple-500 to-purple-700 dark:from-violet-600 dark:to-fuchsia-800",
    Safety: "from-red-500 to-red-700 dark:from-rose-600 dark:to-red-800",
    Administration: "from-blue-500 to-blue-700 dark:from-sky-600 dark:to-cyan-800",
    Worship: "from-green-500 to-green-700 dark:from-emerald-600 dark:to-green-800",
    Ministry: "from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800",
    "Life Skills": "from-orange-500 to-orange-700 dark:from-amber-600 dark:to-orange-800",
  };

  const DualModePrimaryButtonClass =
    "rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";
  const DualModeCardClass =
    "border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-white hover:shadow-lg transition-all duration-200 cursor-pointer group";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30">
        <Info className="text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-200">
          Training Academy
        </AlertTitle>
        <AlertDescription className="text-blue-800/90 dark:text-blue-300/90">
          Browse competency-based courses with sequential modules. Click a course to
          manage modules, enroll people, and track progress. Completing all modules
          earns a badge on the person&apos;s profile.
        </AlertDescription>
      </Alert>

      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Training Academy</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Competency-based courses with sequential modules
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddCourseOpen(true)}
              className={DualModePrimaryButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map(course => {
              const modules = getCourseModules(course.id);
              const enrollments = getCourseEnrollmentCount(course.id);
              const completedCount = progress.filter(
                p => p.courseId === course.id && p.status === "completed",
              ).length;
              const colorClass =
                categoryColors[course.category] || categoryColors.Leadership;

              return (
                <Card
                  key={course.id}
                  className={DualModeCardClass}
                  onClick={() => router.push(`/training/${course.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}
                      >
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                          {course.category}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">
                      {course.name}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-zinc-400">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <ListChecks className="w-4 h-4" />
                      <span>
                        {modules.length} module{modules.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 dark:text-zinc-500">Enrolled</p>
                        <p className="text-slate-900 dark:text-white">
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
                        className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
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

          {courses.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-zinc-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
              <p>No training courses yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTrainingCourseDialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen} />

      <EnrollTrainingDialog
        open={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        courseId={selectedCourseId}
      />
    </div>
  );
}
