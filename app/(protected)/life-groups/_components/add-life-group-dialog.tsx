"use client";

import { useEffect, useRef, useState } from "react";
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
import { Plus, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import type { LifeGroupCategory } from "@/lib/supabase/life-groups";

interface AddLifeGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLifeGroupDialog({
  open,
  onOpenChange,
}: AddLifeGroupDialogProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) returnFocus.current = document.activeElement as HTMLElement;
  }, [open]);
  const { addLifeGroup, isSaving } = useGroupsMinistry();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LifeGroupCategory | "">("");
  const [color, setColor] = useState("purple");

  const resetForm = () => {
    setGroupName("");
    setDescription("");
    setCategory("");
    setColor("purple");
  };

  const handleSave = async () => {
    if (!groupName.trim() || !category || isSaving) return;

    const group = await addLifeGroup({
      name: groupName,
      description,
      category,
      color,
    });

    if (group) {
      resetForm();
      onOpenChange(false);
    }
  };

  const isFormValid = groupName.trim() !== "" && category !== "";

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!isSaving) onOpenChange(value);
      }}
    >
      <DialogContent
        onCloseAutoFocus={() => returnFocus.current?.focus()}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px] border-slate-200/60 bg-white dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]" />
            <div>
              <DialogTitle className="text-slate-900 dark:text-white">
                Add New Life Group
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-zinc-400">
                Fill out the details to create a new fellowship group.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <fieldset disabled={isSaving} className="grid min-w-0 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-zinc-300">
              Group Name
            </Label>
            <Input
              id="name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="e.g., Sons of Thunder"
              className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-slate-700 dark:text-zinc-300"
            >
              Category
            </Label>
            <Select
              value={category}
              disabled={isSaving}
              onValueChange={v => setCategory(v as LifeGroupCategory)}
            >
              <SelectTrigger
                id="category"
                className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              >
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Adults">Adults</SelectItem>
                <SelectItem value="Youth">Youth</SelectItem>
                <SelectItem value="Children">Children</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-slate-700 dark:text-zinc-300"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of the group's focus"
              className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="color"
              className="text-slate-700 dark:text-zinc-300"
            >
              Group Color
            </Label>
            <Select value={color} onValueChange={setColor} disabled={isSaving}>
              <SelectTrigger
                id="color"
                className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="indigo">Indigo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </fieldset>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            className="rounded-lg dark:border-zinc-600 dark:text-zinc-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!isFormValid || isSaving}
            className="rounded-lg bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
