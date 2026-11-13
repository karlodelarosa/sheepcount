"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PersonSelect } from "@/components/person-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { usePeople } from "@/lib/people";
import { useTraining } from "@/lib/training";
import { isEligibleWorkerCandidate } from "@/lib/worker-onboarding";
import { useWorkerOnboarding } from "@/lib/worker-onboarding-context";

type ControlledDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConfigureOnboardingCourseDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const { courses, modules } = useTraining();
  const { config, isSaving, setCourse } = useWorkerOnboarding();
  const [courseId, setCourseId] = useState(config?.courseId ?? "");
  const eligibleCourses = useMemo(
    () => courses.filter(course => modules.some(m => m.courseId === course.id)),
    [courses, modules],
  );

  useEffect(() => {
    if (open) setCourseId(config?.courseId ?? "");
  }, [config?.courseId, open]);

  const save = async () => {
    if (!courseId) return;
    if (await setCourse(courseId)) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure onboarding program</DialogTitle>
          <DialogDescription>
            Select an active Training Academy course. Existing candidates keep
            their original course when this setting changes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="onboarding-course">Training course</Label>
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger id="onboarding-course">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {eligibleCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {eligibleCourses.length === 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Add at least one module to a Training Academy course first.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            disabled={!courseId || isSaving}
            className="bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] focus-visible:ring-[var(--accent-color)]"
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddWorkerCandidateDialog({
  open,
  onOpenChange,
}: ControlledDialogProps) {
  const { people } = usePeople();
  const { workMinistries } = useGroupsMinistry();
  const { candidates, config, isSaving, addCandidate } = useWorkerOnboarding();
  const [personId, setPersonId] = useState("");
  const [ministryId, setMinistryId] = useState("");
  const candidatePersonIds = useMemo(
    () => new Set(candidates.map(candidate => candidate.personId)),
    [candidates],
  );
  const eligiblePeople = useMemo(
    () =>
      people.filter(person =>
        isEligibleWorkerCandidate(person, candidatePersonIds),
      ),
    [candidatePersonIds, people],
  );

  useEffect(() => {
    if (!open) return;
    setPersonId("");
    setMinistryId("");
  }, [open]);

  const add = async () => {
    if (!personId || !ministryId) return;
    if (await addCandidate({ personId, targetMinistryId: ministryId })) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add onboarding candidate</DialogTitle>
          <DialogDescription>
            Enroll an active member or attender in the configured program and
            select where they are preparing to serve.
          </DialogDescription>
        </DialogHeader>
        {!config ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Configure an onboarding course before adding candidates.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Person</Label>
              <PersonSelect
                people={eligiblePeople}
                value={personId}
                onValueChange={setPersonId}
                placeholder="Select a member or attender"
                emptyMessage="No eligible people found"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-ministry">Target ministry</Label>
              <Select value={ministryId} onValueChange={setMinistryId}>
                <SelectTrigger id="candidate-ministry">
                  <SelectValue placeholder="Select a ministry" />
                </SelectTrigger>
                <SelectContent>
                  {workMinistries.map(ministry => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void add()}
            disabled={!config || !personId || !ministryId || isSaving}
            className="bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] focus-visible:ring-[var(--accent-color)]"
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Add candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
