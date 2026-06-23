"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Award,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Info,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  TrendingUp,
  Trash2,
  X,
} from "lucide-react";
import { usePeople } from "@/lib/people";
import { useTraining } from "@/lib/training";
import { ConfirmDeleteDialog } from "@/app/(protected)/work-ministry/_components/confirm-delete-dialog";

interface CourseDetailsProps {
  courseId: string;
  onBack: () => void;
}

export function CourseDetails({ courseId, onBack }: CourseDetailsProps) {
  const { people } = usePeople();
  const {
    courses,
    hydrated,
    isSaving,
    updateCourse,
    removeCourse,
    enrollPersonInCourse,
    removeEnrollment,
    addModule,
    removeModuleById,
    moveModule,
    updateModuleProgress,
    getCourseModules,
    getCourseProgressRows,
  } = useTraining();

  const [activeTab, setActiveTab] = useState("overview");
  const [newPersonId, setNewPersonId] = useState("");
  const [selectedProgressId, setSelectedProgressId] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [mondayMissionAction, setMondayMissionAction] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInitialized, setEditInitialized] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const courseModules = useMemo(
    () => getCourseModules(courseId),
    [getCourseModules, courseId],
  );
  const courseProgress = useMemo(
    () => getCourseProgressRows(courseId),
    [getCourseProgressRows, courseId],
  );

  const enrollmentRows = useMemo(
    () =>
      courseProgress.map(row => {
        const moduleCount = courseModules.length;
        const completed = row.completedModuleIds.length;
        const progressPercent =
          moduleCount > 0 ? Math.round((completed / moduleCount) * 100) : 0;
        return {
          ...row,
          person: people.find(p => p.id === row.personId),
          progressPercent,
          completed,
          total: moduleCount,
        };
      }),
    [courseProgress, people, courseModules.length],
  );

  const activeProgressId =
    selectedProgressId || enrollmentRows[0]?.id || "";

  const activeEnrollment = enrollmentRows.find(e => e.id === activeProgressId);

  const enrolledPersonIds = useMemo(
    () => new Set(courseProgress.map(e => e.personId)),
    [courseProgress],
  );

  const availablePeople = useMemo(
    () => people.filter(p => !enrolledPersonIds.has(p.id)),
    [people, enrolledPersonIds],
  );

  const openProgressForEnrollment = (progressId: string) => {
    setSelectedProgressId(progressId);
    setActiveTab("progress");
  };

  const handleEnroll = async () => {
    if (!newPersonId) return;
    const result = await enrollPersonInCourse({ courseId, personId: newPersonId });
    if (result) {
      setNewPersonId("");
      setSelectedProgressId(result.id);
      setActiveTab("progress");
    }
  };

  const handleAddModule = async () => {
    if (!moduleName.trim()) return;
    const result = await addModule({
      courseId,
      name: moduleName,
      description: moduleDescription,
    });
    if (result) {
      setModuleName("");
      setModuleDescription("");
    }
  };

  const handleCompleteNextModule = async (moduleId: string) => {
    if (!activeEnrollment) return;
    await updateModuleProgress({
      personId: activeEnrollment.personId,
      courseId,
      progressId: activeEnrollment.id,
      moduleId,
      mondayMissionAction,
    });
    setMondayMissionAction("");
  };

  useEffect(() => {
    if (!course || editInitialized) return;
    setEditName(course.name);
    setEditDescription(course.description);
    setEditInitialized(true);
  }, [course, editInitialized]);

  const handleSaveCourse = async () => {
    if (!editName.trim()) return;
    await updateCourse({
      courseId,
      name: editName,
      description: editDescription,
    });
  };

  const handleDeleteCourse = async () => {
    const success = await removeCourse(courseId);
    if (success) {
      setIsDeleteDialogOpen(false);
      onBack();
    }
  };

  const nextModule = activeEnrollment
    ? courseModules.find(m => !activeEnrollment.completedModuleIds.includes(m.id))
    : undefined;

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeSecondaryBadgeClass =
    "rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
  const DualModeMemberAvatarClass =
    "from-slate-900 to-slate-700 dark:from-purple-700 dark:to-purple-500";
  const tabTriggerClass =
    "text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white";

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900 dark:text-white">Course Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30">
        <Info className="text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-200">
          Course Management
        </AlertTitle>
        <AlertDescription className="text-blue-800/90 dark:text-blue-300/90">
          Manage this training course — add sequential modules, enroll people, and
          track module completion. Modules must be completed in order; finishing all
          modules earns a badge on the person&apos;s profile.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-zinc-700">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-slate-900 dark:text-white">{course.name}</h1>
              <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
                {course.category}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-zinc-400">
              {course.description || "Training course"}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
              {courseModules.length} module{courseModules.length !== 1 ? "s" : ""} ·{" "}
              {enrollmentRows.length} enrolled
            </p>
          </div>
        </div>
        <Badge variant="secondary" className={DualModeSecondaryBadgeClass}>
          <GraduationCap className="w-3 h-3 mr-1 inline" />
          {enrollmentRows.filter(e => e.status === "completed").length} completed
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Enroll Person
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Add someone to this course to begin tracking their module progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Person</Label>
              <Select value={newPersonId} onValueChange={setNewPersonId}>
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                      {person.householdName ? ` · ${person.householdName}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => void handleEnroll()}
              disabled={!newPersonId || isSaving}
              className={`w-full ${DualModePrimaryButtonClass}`}
            >
              Enroll
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-10 p-1 bg-slate-100/80 dark:bg-zinc-800/80">
              <TabsTrigger value="overview" className={tabTriggerClass}>
                <LayoutDashboard className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="manage" className={tabTriggerClass}>
                <ListChecks className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Modules
              </TabsTrigger>
              <TabsTrigger value="progress" className={tabTriggerClass}>
                <TrendingUp className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="settings" className={tabTriggerClass}>
                <Settings className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Enrollments
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    People in this course — click to view their progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollmentRows.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      No enrollments yet. Add a person to get started.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {enrollmentRows.map(row => (
                        <div
                          key={row.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
                          onClick={() => openProgressForEnrollment(row.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                            >
                              <span className="text-white text-sm">
                                {row.person?.name.charAt(0) ?? "?"}
                              </span>
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white font-medium">
                                {row.person?.name ?? "Unknown"}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-zinc-500">
                                Enrolled{" "}
                                {new Date(row.enrolledDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              {row.status === "completed" ? (
                                <>
                                  <Badge className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 mb-1">
                                    <Award className="w-3 h-3 mr-1 inline" />
                                    Badge earned
                                  </Badge>
                                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                                    {row.completedAt
                                      ? new Date(row.completedAt).toLocaleDateString()
                                      : "Completed"}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                                    {row.progressPercent}%
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                                    {row.completed}/{row.total} modules
                                  </p>
                                </>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-500"
                              onClick={e => {
                                e.stopPropagation();
                                void removeEnrollment(row.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                        <ListChecks className="w-5 h-5" />
                        Module Summary
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-zinc-400">
                        Sequential modules for this course
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("manage")}
                      className="rounded-lg"
                    >
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {courseModules.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-6">
                      No modules defined yet.{" "}
                      <button
                        type="button"
                        className="text-purple-600 dark:text-purple-400 underline"
                        onClick={() => setActiveTab("manage")}
                      >
                        Add modules
                      </button>{" "}
                      to set up this course.
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {courseModules.map((module, index) => (
                        <li
                          key={module.id}
                          className="flex gap-3 p-3 rounded-lg border border-slate-200 dark:border-zinc-700"
                        >
                          <span className="text-sm text-slate-400 dark:text-zinc-500 w-6 shrink-0">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {module.name}
                            </p>
                            {module.description && (
                              <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5">
                                {module.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <ListChecks className="w-5 h-5" />
                    Manage Modules
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    Add, reorder, or remove modules — learners complete them in order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30">
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Add new module
                    </p>
                    <div className="space-y-2">
                      <Label>Module name *</Label>
                      <Input
                        value={moduleName}
                        onChange={e => setModuleName(e.target.value)}
                        placeholder="e.g., Introduction to leadership"
                        className={DualModeInputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        value={moduleDescription}
                        onChange={e => setModuleDescription(e.target.value)}
                        placeholder="What does this module cover?"
                        className={DualModeInputClass}
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={() => void handleAddModule()}
                      disabled={!moduleName.trim() || isSaving}
                      className={DualModePrimaryButtonClass}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Module
                    </Button>
                  </div>

                  {courseModules.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      No modules yet. Add your first one above.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                        Course modules ({courseModules.length})
                      </p>
                      {courseModules.map((module, index) => (
                        <div
                          key={module.id}
                          className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 dark:border-zinc-700"
                        >
                          <span className="text-sm text-slate-400 dark:text-zinc-500 w-6 pt-0.5 shrink-0">
                            {index + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 dark:text-white font-medium">
                              {module.name}
                            </p>
                            {module.description && (
                              <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5">
                                {module.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isSaving || index === 0}
                              onClick={() =>
                                void moveModule(courseId, module.id, "up")
                              }
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={
                                isSaving || index === courseModules.length - 1
                              }
                              onClick={() =>
                                void moveModule(courseId, module.id, "down")
                              }
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-500"
                              disabled={isSaving}
                              onClick={() => void removeModuleById(module.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Module Progress
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-zinc-400">
                        Mark modules complete for an enrolled person
                      </CardDescription>
                    </div>
                    {enrollmentRows.length > 0 && (
                      <Select
                        value={activeProgressId}
                        onValueChange={setSelectedProgressId}
                      >
                        <SelectTrigger className={`w-full sm:w-56 ${DualModeInputClass}`}>
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                        <SelectContent>
                          {enrollmentRows.map(row => (
                            <SelectItem key={row.id} value={row.id}>
                              {row.person?.name ?? "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!activeEnrollment ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      Enroll someone to track their module progress.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activeEnrollment.status === "completed" && (
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-amber-900 dark:text-amber-200">
                              Badge earned
                            </p>
                            <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
                              {course.name} completed
                              {activeEnrollment.completedAt &&
                                ` on ${new Date(activeEnrollment.completedAt).toLocaleDateString()}`}
                              . This badge appears on their person profile.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${DualModeMemberAvatarClass} flex items-center justify-center`}
                          >
                            <span className="text-white">
                              {activeEnrollment.person?.name.charAt(0) ?? "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {activeEnrollment.person?.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-zinc-500">
                              {activeEnrollment.completed}/{activeEnrollment.total} modules ·{" "}
                              {activeEnrollment.progressPercent}%
                            </p>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all"
                            style={{ width: `${activeEnrollment.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {courseModules.length === 0 ? (
                        <p className="text-slate-500 dark:text-zinc-400 text-center py-4">
                          No modules defined yet.{" "}
                          <button
                            type="button"
                            className="text-purple-600 dark:text-purple-400 underline"
                            onClick={() => setActiveTab("manage")}
                          >
                            Add modules
                          </button>{" "}
                          in the Manage tab first.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {courseModules.map(module => {
                            const isComplete =
                              activeEnrollment.completedModuleIds.includes(module.id);
                            const isNext = nextModule?.id === module.id;

                            return (
                              <div
                                key={module.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-zinc-700"
                              >
                                <Checkbox
                                  checked={isComplete}
                                  disabled={
                                    isSaving ||
                                    isComplete ||
                                    activeEnrollment.status === "completed" ||
                                    !isNext
                                  }
                                  onCheckedChange={() =>
                                    void handleCompleteNextModule(module.id)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <p
                                    className={
                                      isComplete
                                        ? "text-slate-500 line-through dark:text-zinc-500"
                                        : "text-slate-900 dark:text-white"
                                    }
                                  >
                                    {module.name}
                                  </p>
                                  {module.description && (
                                    <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5">
                                      {module.description}
                                    </p>
                                  )}
                                  {isNext && activeEnrollment.status !== "completed" && (
                                    <div className="mt-3 space-y-2">
                                      <Label className="text-xs">
                                        Monday Mission Action (optional)
                                      </Label>
                                      <Textarea
                                        value={mondayMissionAction}
                                        onChange={e =>
                                          setMondayMissionAction(e.target.value)
                                        }
                                        placeholder="How will they apply this at work this week?"
                                        className={DualModeInputClass}
                                        rows={2}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Course Details
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    Update course information or remove this training
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className={DualModeInputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className={DualModeInputClass}
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={() => void handleSaveCourse()}
                      disabled={!editName.trim() || isSaving}
                      className={DualModePrimaryButtonClass}
                    >
                      Save Changes
                    </Button>
                  </div>

                  <div className="border-t border-slate-200 dark:border-zinc-700 pt-6 space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Danger zone
                    </p>
                    <p className="text-sm text-slate-500 dark:text-zinc-500">
                      {course.isDefault
                        ? "Built-in courses cannot be removed."
                        : "Removing this course will hide it from the training list and remove it from participant profiles."}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      disabled={course.isDefault || isSaving}
                      className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete training course?"
        description={`"${course.name}" will be removed from the training list and hidden from participant profiles.`}
        confirmLabel="Delete Course"
        onConfirm={handleDeleteCourse}
        isLoading={isSaving}
      />
    </div>
  );
}
