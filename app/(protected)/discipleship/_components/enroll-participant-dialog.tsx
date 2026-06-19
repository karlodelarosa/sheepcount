"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import type { Person } from "@/lib/people";
import type {
  DiscipleshipEnrollment,
  DiscipleshipRole,
  DiscipleshipTrack,
  EnrollInTrackInput,
} from "@/lib/supabase/discipleship";

interface EnrollParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackId: string | null;
  tracks: DiscipleshipTrack[];
  people: Person[];
  enrollments: DiscipleshipEnrollment[];
  isSaving: boolean;
  onEnroll: (input: EnrollInTrackInput) => Promise<DiscipleshipEnrollment | null>;
}

export function EnrollParticipantDialog({
  open,
  onOpenChange,
  trackId,
  tracks,
  people,
  enrollments,
  isSaving,
  onEnroll,
}: EnrollParticipantDialogProps) {
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [role, setRole] = useState<DiscipleshipRole | "">("");
  const [mentorPersonId, setMentorPersonId] = useState("");

  const track = tracks.find(t => t.id === trackId);

  const availablePeople = useMemo(() => {
    const enrolledIds = enrollments
      .filter(e => e.trackId === trackId && e.status === "active")
      .map(e => e.personId);

    return people.filter(p => !enrolledIds.includes(p.id));
  }, [people, enrollments, trackId]);

  const mentorCandidates = useMemo(
    () => people.filter(p => p.id !== selectedPersonId),
    [people, selectedPersonId],
  );

  const resetForm = () => {
    setSelectedPersonId("");
    setRole("");
    setMentorPersonId("");
  };

  const handleEnroll = async () => {
    if (!selectedPersonId || !role || !trackId) return;

    const enrollment = await onEnroll({
      trackId,
      personId: selectedPersonId,
      role,
      mentorPersonId: role === "Learner" && mentorPersonId ? mentorPersonId : undefined,
    });

    if (enrollment) {
      resetForm();
      onOpenChange(false);
    }
  };

  const DualModePrimaryButtonClass = "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass = "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeLabelClass = "text-slate-700 dark:text-zinc-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-zinc-800 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Enroll Participant
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Assign a person to the {track?.name ?? "selected"} program.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="person" className={DualModeLabelClass}>Select Person</Label>
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger id="person" className={DualModeInputClass}>
                <SelectValue placeholder="Choose a person to enroll" />
              </SelectTrigger>
              <SelectContent>
                {availablePeople.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No available people
                  </SelectItem>
                ) : (
                  availablePeople.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} - {person.householdName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className={DualModeLabelClass}>Role in Program</Label>
            <Select value={role} onValueChange={v => setRole(v as DiscipleshipRole)}>
              <SelectTrigger id="role" className={DualModeInputClass}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Learner">Learner (Being Discipled)</SelectItem>
                <SelectItem value="Guide">Guide (Discipling Others)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === "Learner" && (
            <div className="space-y-2">
              <Label htmlFor="mentor" className={DualModeLabelClass}>
                Mentor {track?.category === "Mentorship" ? "*" : "(optional)"}
              </Label>
              <Select value={mentorPersonId} onValueChange={setMentorPersonId}>
                <SelectTrigger id="mentor" className={DualModeInputClass}>
                  <SelectValue placeholder="Select mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentorCandidates.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => void handleEnroll()}
            disabled={
              !selectedPersonId ||
              !role ||
              isSaving ||
              (role === "Learner" &&
                track?.category === "Mentorship" &&
                !mentorPersonId)
            }
            className={DualModePrimaryButtonClass}
          >
            Enroll in Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
