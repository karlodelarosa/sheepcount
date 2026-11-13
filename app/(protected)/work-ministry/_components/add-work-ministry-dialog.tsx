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

interface AddWorkMinistryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWorkMinistryDialog({
  open,
  onOpenChange,
}: AddWorkMinistryDialogProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) returnFocus.current = document.activeElement as HTMLElement;
  }, [open]);
  const { addWorkMinistry, workMinistries, isSaving } = useGroupsMinistry();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("purple");

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("purple");
  };

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;

    const ministry = await addWorkMinistry({
      name,
      description,
      color,
      sortOrder: workMinistries.length + 1,
    });

    if (ministry) {
      resetForm();
      onOpenChange(false);
    }
  };

  const isFormValid = name.trim() !== "";

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
                Add Work Ministry
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-zinc-400">
                Create a new ministry area. You can set up sub-teams inside it
                after creation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="ministry-name"
              className="text-slate-700 dark:text-zinc-300"
            >
              Ministry Name
            </Label>
            <Input
              id="ministry-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Media Ministry"
              className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="ministry-description"
              className="text-slate-700 dark:text-zinc-300"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="ministry-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief summary of this ministry's focus"
              className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="ministry-color"
              className="text-slate-700 dark:text-zinc-300"
            >
              Color
            </Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="rounded-lg border-slate-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
            Create Ministry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
