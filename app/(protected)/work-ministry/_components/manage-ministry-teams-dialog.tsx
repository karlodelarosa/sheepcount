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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import type { WorkMinistryTeam } from "@/lib/supabase/work-ministries";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

interface ManageMinistryTeamsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministryId: string;
  ministryName: string;
}

export function ManageMinistryTeamsDialog({
  open,
  onOpenChange,
  ministryId,
  ministryName,
}: ManageMinistryTeamsDialogProps) {
  const {
    getMinistryTeams,
    getTeamRoleOptions,
    addWorkMinistryTeam,
    removeWorkMinistryTeamById,
    addTeamRoleOption,
    removeTeamRoleOption,
    isSaving,
  } = useGroupsMinistry();

  const teams = getMinistryTeams(ministryId);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [roleInputs, setRoleInputs] = useState<Record<string, string>>({});
  const [pendingTeam, setPendingTeam] = useState<WorkMinistryTeam | null>(null);

  const teamsWithRoles = useMemo(
    () =>
      teams.map(team => ({
        ...team,
        roles: getTeamRoleOptions(team.id),
      })),
    [teams, getTeamRoleOptions],
  );

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    const result = await addWorkMinistryTeam(ministryId, {
      name: newTeamName,
      description: newTeamDescription,
      sortOrder: teams.length + 1,
    });
    if (result) {
      setNewTeamName("");
      setNewTeamDescription("");
    }
  };

  const handleAddRole = async (teamId: string) => {
    const name = roleInputs[teamId]?.trim();
    if (!name) return;
    const result = await addTeamRoleOption(teamId, name);
    if (result) {
      setRoleInputs(prev => ({ ...prev, [teamId]: "" }));
    }
  };

  const handleConfirmRemoveTeam = async () => {
    if (!pendingTeam) return;
    const success = await removeWorkMinistryTeamById(pendingTeam.id);
    if (success) setPendingTeam(null);
  };

  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Manage Teams
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Set up sub-teams within {ministryName} and define the service roles
            for each team (e.g. Musician, Audio Tech).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {teamsWithRoles.length > 0 && (
            <div className="space-y-4">
              {teamsWithRoles.map(team => (
                <div
                  key={team.id}
                  className="rounded-xl border border-slate-200/60 p-4 space-y-3 dark:border-zinc-700/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingTeam(team)}
                      disabled={isSaving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-zinc-300 text-xs">
                      Service roles for this team
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {team.roles.length === 0 ? (
                        <span className="text-sm text-slate-500 dark:text-zinc-500 italic">
                          No roles defined yet
                        </span>
                      ) : (
                        team.roles.map(role => (
                          <Badge
                            key={role.id}
                            variant="secondary"
                            className="rounded-md gap-1 pr-1 bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300"
                          >
                            {role.name}
                            <button
                              type="button"
                              onClick={() => void removeTeamRoleOption(role.id)}
                              disabled={isSaving}
                              className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-zinc-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add role (e.g. Musician)"
                        value={roleInputs[team.id] ?? ""}
                        onChange={e =>
                          setRoleInputs(prev => ({
                            ...prev,
                            [team.id]: e.target.value,
                          }))
                        }
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleAddRole(team.id);
                          }
                        }}
                        className={DualModeInputClass}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void handleAddRole(team.id)}
                        disabled={isSaving || !roleInputs[team.id]?.trim()}
                        className="shrink-0 rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-dashed border-slate-300 p-4 space-y-3 dark:border-zinc-600">
            <h3 className="font-medium text-slate-900 dark:text-white">
              Add new team
            </h3>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-zinc-300">
                Team name
              </Label>
              <Input
                placeholder="e.g. Production Team"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                className={DualModeInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-zinc-300">
                Description (optional)
              </Label>
              <Input
                placeholder="e.g. Musicians, audio, and lyrics"
                value={newTeamDescription}
                onChange={e => setNewTeamDescription(e.target.value)}
                className={DualModeInputClass}
              />
            </div>
            <Button
              onClick={() => void handleAddTeam()}
              disabled={isSaving || !newTeamName.trim()}
              className={DualModePrimaryButtonClass}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <ConfirmDeleteDialog
      open={pendingTeam !== null}
      onOpenChange={open => {
        if (!open) setPendingTeam(null);
      }}
      title="Remove Team"
      description={
        pendingTeam
          ? `Remove "${pendingTeam.name}"? Members in this team will become unassigned to a team.`
          : ""
      }
      confirmLabel="Remove Team"
      onConfirm={handleConfirmRemoveTeam}
      isLoading={isSaving}
    />
    </>
  );
}
