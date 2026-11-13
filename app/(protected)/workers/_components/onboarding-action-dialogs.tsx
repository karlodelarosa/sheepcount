"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/app/(protected)/work-ministry/_components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import type { WorkerOnboardingCandidate } from "@/lib/worker-onboarding";
import { useWorkerOnboarding } from "@/lib/worker-onboarding-context";

type CandidateDialogProps = {
  candidate: WorkerOnboardingCandidate | null;
  personName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubmitCandidateDialog({
  candidate,
  personName,
  open,
  onOpenChange,
}: CandidateDialogProps) {
  const { isSaving, submitCandidate } = useWorkerOnboarding();
  const submit = async () => {
    if (candidate && (await submitCandidate(candidate.id))) onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit for approval</DialogTitle>
          <DialogDescription>
            Confirm that {personName} has completed the onboarding course and is
            ready for leadership review.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={!candidate || isSaving}
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewCandidateDialog({
  candidate,
  personName,
  open,
  onOpenChange,
}: CandidateDialogProps) {
  const { isSaving, approveCandidate, returnCandidate } = useWorkerOnboarding();
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setReturning(false);
      setNote("");
    }
  }, [open]);

  const approve = async () => {
    if (candidate && (await approveCandidate(candidate.id)))
      onOpenChange(false);
  };
  const sendBack = async () => {
    if (
      candidate &&
      note.trim() &&
      (await returnCandidate(candidate.id, note.trim()))
    ) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leadership review</DialogTitle>
          <DialogDescription>
            Confirm that {personName} has met with a ministry leader and is
            ready to serve, or return them with clear next steps.
          </DialogDescription>
        </DialogHeader>
        {returning && (
          <div className="space-y-2">
            <Label htmlFor="return-note">Return note</Label>
            <Textarea
              id="return-note"
              value={note}
              maxLength={2000}
              onChange={event => setNote(event.target.value)}
              placeholder="What should the candidate complete or revisit?"
              rows={4}
            />
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              returning ? setReturning(false) : onOpenChange(false)
            }
          >
            {returning ? "Back" : "Cancel"}
          </Button>
          {returning ? (
            <Button
              variant="destructive"
              onClick={() => void sendBack()}
              disabled={!note.trim() || isSaving}
            >
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Return to training
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setReturning(true)}>
                Return
              </Button>
              <Button
                onClick={() => void approve()}
                disabled={!candidate || isSaving}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeployCandidateDialog({
  candidate,
  personName,
  open,
  onOpenChange,
}: CandidateDialogProps) {
  const { workMinistries, getMinistryTeams, getTeamRoleOptions } =
    useGroupsMinistry();
  const { isSaving, deployCandidate } = useWorkerOnboarding();
  const [membershipType, setMembershipType] = useState<
    "Worker" | "Volunteer Worker"
  >("Volunteer Worker");
  const [ministryId, setMinistryId] = useState("");
  const [teamId, setTeamId] = useState("none");
  const [role, setRole] = useState("Member");
  const [serviceRole, setServiceRole] = useState("");
  const teams = useMemo(
    () => (ministryId ? getMinistryTeams(ministryId) : []),
    [getMinistryTeams, ministryId],
  );
  const roleOptions = useMemo(
    () => (teamId !== "none" ? getTeamRoleOptions(teamId) : []),
    [getTeamRoleOptions, teamId],
  );

  useEffect(() => {
    if (!open) return;
    setMembershipType("Volunteer Worker");
    setMinistryId(candidate?.targetMinistryId ?? "");
    setTeamId("none");
    setRole("Member");
    setServiceRole("");
  }, [candidate?.targetMinistryId, open]);

  const deploy = async () => {
    if (!candidate || !ministryId || !role.trim()) return;
    if (
      await deployCandidate({
        candidateId: candidate.id,
        membershipType,
        ministryId,
        teamId: teamId === "none" ? null : teamId,
        role: role.trim(),
        serviceRole: serviceRole.trim(),
      })
    ) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deploy {personName}</DialogTitle>
          <DialogDescription>
            Promote this person and create their ministry assignment in one
            step.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Membership type</Label>
            <Select
              value={membershipType}
              onValueChange={value =>
                setMembershipType(value as "Worker" | "Volunteer Worker")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Volunteer Worker">
                  Volunteer Worker
                </SelectItem>
                <SelectItem value="Worker">Worker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Ministry</Label>
            <Select
              value={ministryId}
              onValueChange={value => {
                setMinistryId(value);
                setTeamId("none");
                setServiceRole("");
              }}
            >
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label>Team (optional)</Label>
            <Select
              value={teamId}
              onValueChange={value => {
                setTeamId(value);
                setServiceRole("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadership-role">Assignment role</Label>
            <Input
              id="leadership-role"
              value={role}
              maxLength={100}
              onChange={event => setRole(event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Service role (optional)</Label>
            {roleOptions.length > 0 ? (
              <Select
                value={serviceRole || "none"}
                onValueChange={value =>
                  setServiceRole(value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No service role</SelectItem>
                  {roleOptions.map(option => (
                    <SelectItem key={option.id} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={serviceRole}
                maxLength={100}
                onChange={event => setServiceRole(event.target.value)}
                placeholder="e.g. Musician"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void deploy()}
            disabled={!candidate || !ministryId || !role.trim() || isSaving}
            className="bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] focus-visible:ring-[var(--accent-color)]"
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Deploy candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditTargetMinistryDialog({
  candidate,
  personName,
  open,
  onOpenChange,
}: CandidateDialogProps) {
  const { workMinistries } = useGroupsMinistry();
  const { isSaving, updateTargetMinistry } = useWorkerOnboarding();
  const [ministryId, setMinistryId] = useState("");
  useEffect(() => {
    if (open) setMinistryId(candidate?.targetMinistryId ?? "");
  }, [candidate?.targetMinistryId, open]);
  const save = async () => {
    if (
      candidate &&
      ministryId &&
      (await updateTargetMinistry(candidate.id, ministryId))
    )
      onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change target ministry</DialogTitle>
          <DialogDescription>
            Update where {personName} is preparing to serve.
          </DialogDescription>
        </DialogHeader>
        <Select value={ministryId} onValueChange={setMinistryId}>
          <SelectTrigger>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            disabled={!ministryId || isSaving}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RemoveCandidateDialog({
  candidate,
  personName,
  open,
  onOpenChange,
}: CandidateDialogProps) {
  const { isSaving, removeCandidate } = useWorkerOnboarding();
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Remove onboarding candidate"
      description={`Remove ${personName} from worker onboarding? Their Training Academy progress will be preserved.`}
      confirmLabel="Remove candidate"
      isLoading={isSaving}
      onConfirm={async () => {
        if (candidate && (await removeCandidate(candidate.id))) {
          onOpenChange(false);
        }
      }}
    />
  );
}
