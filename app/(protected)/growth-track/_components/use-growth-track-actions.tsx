"use client";

import { useCallback, useMemo, useState } from "react";
import { useGrowthTrack } from "@/lib/growth-track";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useDiscipleship } from "@/lib/discipleship";
import { usePeople } from "@/lib/people";
import type { GrowthTrackPerson } from "../_lib/types";
import type { NextStepAction } from "../_lib/types";
import {
  getActionHubAction,
  getNextStepAction,
} from "../_lib/filters";
import {
  cellGroupHasLeader,
  getEffectiveCellGroupLeaderId,
} from "@/lib/growth-track/cell-group-utils";
import {
  GrowthTrackActionDialog,
  isDialogAction,
  type GrowthTrackDialogMode,
} from "./growth-track-action-dialog";
import {
  FollowUpDialog,
  type FollowUpMethod,
} from "./follow-up-dialog";

export function useGrowthTrackActions() {
  const {
    completeFollowUp,
    moveToFollowUp,
    assignToCellGroup,
    assignToLifeGroup,
    enrollInDiscipleship,
    logOutreach,
    advanceStage,
    isSaving,
  } = useGrowthTrack();
  const { cellGroups, cellGroupMembers, lifeGroups } = useGroupsMinistry();
  const { people } = usePeople();
  const { tracks } = useDiscipleship();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<GrowthTrackDialogMode>(
    "assign_cell_group",
  );
  const [activePerson, setActivePerson] = useState<GrowthTrackPerson | null>(
    null,
  );

  const executeAction = useCallback(
    async (person: GrowthTrackPerson, action: NextStepAction["action"]) => {
      switch (action) {
        case "complete_follow_up":
          setActivePerson(person);
          setFollowUpOpen(true);
          break;
        case "move_to_follow_up":
          await moveToFollowUp(person.id);
          break;
        case "assign_cell_group":
          setActivePerson(person);
          setDialogMode("assign_cell_group");
          setDialogOpen(true);
          break;
        case "assign_life_group":
          setActivePerson(person);
          setDialogMode("assign_life_group");
          setDialogOpen(true);
          break;
        case "enroll_discipleship":
          setActivePerson(person);
          setDialogMode("enroll_discipleship");
          setDialogOpen(true);
          break;
        case "log_visitation":
          await logOutreach(person.id, "visitation");
          break;
        case "log_contact":
          await logOutreach(person.id, "contact");
          break;
        case "advance_to_worker":
          await advanceStage(person.id, "Worker", "Promoted to worker stage");
          break;
      }
    },
    [moveToFollowUp, logOutreach, advanceStage],
  );

  const handlePersonAction = useCallback(
    async (person: GrowthTrackPerson) => {
      const nextStep = getNextStepAction(person);
      await executeAction(person, nextStep.action);
    },
    [executeAction],
  );

  const handleHubAction = useCallback(
    async (person: GrowthTrackPerson) => {
      const hubAction = getActionHubAction(person);
      await executeAction(person, hubAction.action);
    },
    [executeAction],
  );

  const cellGroupOptions = useMemo(() => {
    return cellGroups
      .map(g => {
        const leaderId = getEffectiveCellGroupLeaderId(g, cellGroupMembers);
        const leader = leaderId
          ? people.find(p => p.id === leaderId)
          : undefined;
        return {
          id: g.id,
          label: leader
            ? `${g.name} — led by ${leader.name}`
            : `${g.name} — no leader yet`,
          hasLeader: Boolean(leaderId),
        };
      })
      .sort((a, b) => Number(b.hasLeader) - Number(a.hasLeader))
      .map(({ id, label }) => ({ id, label }));
  }, [cellGroups, cellGroupMembers, people]);

  const assignCellGroupOptions = useMemo(() => {
    if (!activePerson || dialogMode !== "assign_cell_group") {
      return cellGroupOptions;
    }

    const currentGroupId = activePerson.cellGroupId;
    const currentGroup = currentGroupId
      ? cellGroups.find(g => g.id === currentGroupId)
      : undefined;
    const currentHasLeader = cellGroupHasLeader(currentGroup, cellGroupMembers);

    if (
      activePerson.assignmentStatus === "ready_for_leader" &&
      currentGroupId &&
      !currentHasLeader
    ) {
      const alternatives = cellGroupOptions.filter(
        opt =>
          opt.id !== currentGroupId &&
          cellGroupHasLeader(
            cellGroups.find(g => g.id === opt.id),
            cellGroupMembers,
          ),
      );
      return alternatives.length > 0 ? alternatives : cellGroupOptions;
    }

    if (currentGroupId && currentHasLeader) {
      return cellGroupOptions.filter(opt => opt.id !== currentGroupId);
    }

    return cellGroupOptions;
  }, [
    activePerson,
    cellGroupOptions,
    cellGroups,
    cellGroupMembers,
    dialogMode,
  ]);

  const assignCellGroupHint = useMemo(() => {
    if (!activePerson || dialogMode !== "assign_cell_group") return undefined;

    const currentGroup = activePerson.cellGroupId
      ? cellGroups.find(g => g.id === activePerson.cellGroupId)
      : undefined;
    const currentHasLeader = cellGroupHasLeader(currentGroup, cellGroupMembers);

    if (
      activePerson.assignmentStatus === "ready_for_leader" &&
      currentGroup &&
      !currentHasLeader
    ) {
      if (assignCellGroupOptions.length === 0) {
        return "This person's cell group has no leader, and no other cell groups are available to join.";
      }
      return "This person's current cell group has no leader. Choose a group with a leader below.";
    }

    if (assignCellGroupOptions.length === 0) {
      if (cellGroupOptions.length === 0) {
        return "No cell groups exist yet. Create one in Cell Groups first.";
      }
      if (activePerson.cellGroupId && currentHasLeader) {
        return "This person is already placed in their cell group. No other groups to join.";
      }
    }

    return undefined;
  }, [
    activePerson,
    assignCellGroupOptions.length,
    cellGroupOptions.length,
    cellGroups,
    cellGroupMembers,
    dialogMode,
  ]);

  const dialogOptions =
    dialogMode === "assign_cell_group"
      ? assignCellGroupOptions
      : dialogMode === "assign_life_group"
        ? lifeGroups.map(g => ({ id: g.id, label: g.name }))
        : tracks
            .filter(t => t.isActive)
            .map(t => ({ id: t.id, label: t.name }));

  const handleDialogConfirm = async (selectedId: string) => {
    if (!activePerson) return;

    if (dialogMode === "assign_cell_group") {
      await assignToCellGroup(activePerson.id, selectedId);
    } else if (dialogMode === "assign_life_group") {
      await assignToLifeGroup(activePerson.id, selectedId);
    } else {
      await enrollInDiscipleship(activePerson.id, selectedId);
    }
  };

  const handleFollowUpConfirm = async (method: FollowUpMethod, notes: string) => {
    if (!activePerson) return;
    await completeFollowUp(activePerson.id, method, notes);
  };

  const ActionDialog = (
    <>
      <FollowUpDialog
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        personName={activePerson?.name ?? ""}
        isSaving={isSaving}
        onConfirm={handleFollowUpConfirm}
      />
      <GrowthTrackActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        personName={activePerson?.name ?? ""}
        mode={dialogMode}
        options={dialogOptions}
        hint={assignCellGroupHint}
        isSaving={isSaving}
        onConfirm={handleDialogConfirm}
      />
    </>
  );

  return {
    handlePersonAction,
    handleHubAction,
    executeAction,
    ActionDialog,
    isSaving,
  };
}

export { isDialogAction };
