"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import type { LifeGroup } from "@/lib/supabase/life-groups";

export function ScheduleDialog({
  group,
  onClose,
}: {
  group: LifeGroup;
  onClose: () => void;
}) {
  const [returnFocus] = useState(() =>
    typeof document !== "undefined"
      ? (document.activeElement as HTMLElement | null)
      : null,
  );
  const [schedule, setSchedule] = useState(group.schedule);
  const { updateLifeGroupById, isSaving } = useGroupsMinistry();
  async function save() {
    if (isSaving) return;
    if (await updateLifeGroupById(group.id, { schedule: schedule.trim() }))
      onClose();
  }
  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogContent onCloseAutoFocus={() => returnFocus?.focus()}>
        <DialogHeader>
          <DialogTitle>
            {group.schedule.trim() ? "Edit Schedule" : "Set Schedule"}
          </DialogTitle>
          <DialogDescription>
            Meeting schedule for {group.name}. Clear the field to remove the
            schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="group-schedule">Schedule</Label>
          <Input
            id="group-schedule"
            value={schedule}
            disabled={isSaving}
            onChange={e => setSchedule(e.target.value)}
            placeholder="e.g., Every Saturday, 7:00 PM"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" disabled={isSaving} onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isSaving || schedule === group.schedule}
            onClick={() => void save()}
            className="bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
          >
            {isSaving ? "Saving..." : "Save Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
