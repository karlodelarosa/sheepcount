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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import type { LifeGroup } from "@/lib/supabase/life-groups";

interface EditLifeGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: LifeGroup;
  isSaving?: boolean;
  onSave: (updates: {
    name: string;
    description: string;
    schedule: string;
  }) => void | Promise<void>;
}

export function EditLifeGroupDialog({
  open,
  onOpenChange,
  group,
  isSaving = false,
  onSave,
}: EditLifeGroupDialogProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [schedule, setSchedule] = useState(group.schedule);

  useEffect(() => {
    if (open) {
      setName(group.name);
      setDescription(group.description);
      setSchedule(group.schedule);
    }
  }, [open, group]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave({ name, description, schedule });
    onOpenChange(false);
  };

  const hasChanges =
    name !== group.name ||
    description !== group.description ||
    schedule !== group.schedule;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-slate-200/60 bg-white dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <DialogTitle className="text-slate-900 dark:text-white">
                Group Details
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-zinc-400">
                Update name, description, and meeting schedule.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-slate-700 dark:text-zinc-300">
              Group Name
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="edit-description"
              className="text-slate-700 dark:text-zinc-300"
            >
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="edit-schedule"
              className="text-slate-700 dark:text-zinc-300"
            >
              Schedule
            </Label>
            <Input
              id="edit-schedule"
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              placeholder="e.g., Every 2nd Saturday, 7:00 PM"
              className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg dark:border-zinc-600 dark:text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!name.trim() || isSaving || !hasChanges}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
