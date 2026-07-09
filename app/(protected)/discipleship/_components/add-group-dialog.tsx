"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users } from "lucide-react";
import type {
  CreateDiscipleshipGroupInput,
  DiscipleshipGroup,
} from "@/lib/supabase/discipleship-groups";

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onCreate: (input: CreateDiscipleshipGroupInput) => Promise<DiscipleshipGroup | null>;
}

export function AddGroupDialog({
  open,
  onOpenChange,
  isSaving,
  onCreate,
}: AddGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    const group = await onCreate({ name, description });

    if (group) {
      resetForm();
      onOpenChange(false);
    }
  };

  const DualModePrimaryButtonClass = "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass = "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeLabelClass = "text-slate-700 dark:text-zinc-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] dark:bg-zinc-800 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" /> Create New Group
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Start a discipleship group. You can add members and log meeting
            topics once it&apos;s created.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name" className={DualModeLabelClass}>Group Name *</Label>
            <Input
              id="group-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Tuesday Night Group"
              className={DualModeInputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description" className={DualModeLabelClass}>Description</Label>
            <Input
              id="group-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional"
              className={DualModeInputClass}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => void handleCreate()}
            disabled={!name.trim() || isSaving}
            className={DualModePrimaryButtonClass}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
