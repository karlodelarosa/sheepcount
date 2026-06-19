"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePeople } from "@/lib/people";
import { useTraining } from "@/lib/training";

interface EnrollTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
}

export function EnrollTrainingDialog({
  open,
  onOpenChange,
  courseId,
}: EnrollTrainingDialogProps) {
  const { people } = usePeople();
  const {
    courses,
    enrollPersonInCourse,
    updateModuleProgress,
    getCourseModules,
    getCourseProgress,
  } = useTraining();

  const [personId, setPersonId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [mondayMissionAction, setMondayMissionAction] = useState("");

  const course = courses.find(c => c.id === courseId);
  const modules = courseId ? getCourseModules(courseId) : [];
  const existingProgress =
    courseId && personId ? getCourseProgress(courseId, personId) : undefined;

  useEffect(() => {
    if (!open) {
      setPersonId("");
      setModuleId("");
      setMondayMissionAction("");
    }
  }, [open]);

  const nextModule = existingProgress
    ? modules.find(m => !existingProgress.completedModuleIds.includes(m.id))
    : modules[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !personId) return;

    if (!existingProgress) {
      const enrolled = await enrollPersonInCourse({ courseId, personId });
      if (!enrolled) return;
      onOpenChange(false);
      return;
    }

    if (!moduleId) return;

    const updated = await updateModuleProgress({
      personId,
      courseId,
      moduleId,
      mondayMissionAction,
    });

    if (updated) {
      onOpenChange(false);
    }
  };

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeDialogClass =
    "bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[500px] ${DualModeDialogClass}`}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            {existingProgress ? "Update Module Progress" : "Enroll in Course"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            {course
              ? existingProgress
                ? `Mark the next module complete for ${course.name}`
                : `Enroll a person in ${course.name}`
              : "Select a course first"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="person" className="text-slate-700 dark:text-zinc-300">
                Person
              </Label>
              <Select
                value={personId}
                onValueChange={setPersonId}
                disabled={!!existingProgress}
              >
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {people.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                      {person.householdName ? ` · ${person.householdName}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {existingProgress && nextModule && (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-zinc-300">
                    Next Module
                  </Label>
                  <Select value={moduleId} onValueChange={setModuleId} required>
                    <SelectTrigger className={DualModeInputClass}>
                      <SelectValue placeholder="Select module to complete" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={nextModule.id}>
                        {nextModule.name}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="monday-mission"
                    className="text-slate-700 dark:text-zinc-300"
                  >
                    Monday Mission Action
                  </Label>
                  <Textarea
                    id="monday-mission"
                    placeholder="How will they apply this at work this week?"
                    value={mondayMissionAction}
                    onChange={e => setMondayMissionAction(e.target.value)}
                    className={DualModeInputClass}
                    rows={3}
                  />
                </div>
              </>
            )}

            {existingProgress?.status === "completed" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                This person has already completed the course.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={DualModePrimaryButtonClass}
              disabled={existingProgress?.status === "completed"}
            >
              {existingProgress ? "Complete Module" : "Enroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Keep legacy export name for any imports
export { EnrollTrainingDialog as RecordTrainingCompletionDialog };
