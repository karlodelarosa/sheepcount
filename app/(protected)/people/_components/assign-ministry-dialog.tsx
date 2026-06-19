"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award } from "lucide-react";
import type {
  WorkMinistry,
  WorkMinistryTeam,
  WorkMinistryTeamRole,
} from "@/lib/supabase/work-ministries";

const LEADERSHIP_ROLES = [
  "Team Lead",
  "Coordinator",
  "Member",
  "Assistant",
] as const;

interface AssignMinistryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  ministries: WorkMinistry[];
  teams: WorkMinistryTeam[];
  teamRoles: WorkMinistryTeamRole[];
  assignedMinistryIds: string[];
  onAssign: (
    ministryId: string,
    role: string,
    options?: { teamId?: string | null; serviceRole?: string },
  ) => void;
}

export function AssignMinistryDialog({
  open,
  onOpenChange,
  personName,
  ministries,
  teams,
  teamRoles,
  assignedMinistryIds,
  onAssign,
}: AssignMinistryDialogProps) {
  const [ministryId, setMinistryId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [serviceRole, setServiceRole] = useState("");
  const [role, setRole] = useState("");

  const availableMinistries = ministries.filter(
    m => !assignedMinistryIds.includes(m.id),
  );

  const ministryTeams = useMemo(
    () => teams.filter(team => team.ministryId === ministryId),
    [teams, ministryId],
  );

  const hasTeams = ministryTeams.length > 0;

  const roleOptions = useMemo(
    () => teamRoles.filter(r => r.teamId === teamId),
    [teamRoles, teamId],
  );

  const canSubmit =
    ministryId &&
    role &&
    (!hasTeams || (teamId && serviceRole));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAssign(ministryId, role, {
      teamId: hasTeams ? teamId : null,
      serviceRole: hasTeams ? serviceRole : "",
    });
    setMinistryId("");
    setTeamId("");
    setServiceRole("");
    setRole("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Assign to Ministry
          </DialogTitle>
          <DialogDescription>
            Assign {personName} to a work ministry
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Ministry</Label>
            <Select
              value={ministryId}
              onValueChange={value => {
                setMinistryId(value);
                setTeamId("");
                setServiceRole("");
              }}
              required
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select ministry" />
              </SelectTrigger>
              <SelectContent>
                {availableMinistries.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    All ministries assigned
                  </SelectItem>
                ) : (
                  availableMinistries.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {hasTeams && (
            <>
              <div className="grid gap-2">
                <Label>Team</Label>
                <Select
                  value={teamId}
                  onValueChange={value => {
                    setTeamId(value);
                    setServiceRole("");
                  }}
                  required
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministryTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Service Role</Label>
                {roleOptions.length > 0 ? (
                  <Select
                    value={serviceRole}
                    onValueChange={setServiceRole}
                    required
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select service role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(option => (
                        <SelectItem key={option.id} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="e.g. Musician"
                    value={serviceRole}
                    onChange={e => setServiceRole(e.target.value)}
                    className="rounded-xl"
                    required
                    disabled={!teamId}
                  />
                )}
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label>Leadership Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select leadership role" />
              </SelectTrigger>
              <SelectContent>
                {LEADERSHIP_ROLES.map(leadershipRole => (
                  <SelectItem key={leadershipRole} value={leadershipRole}>
                    {leadershipRole}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              Assign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
