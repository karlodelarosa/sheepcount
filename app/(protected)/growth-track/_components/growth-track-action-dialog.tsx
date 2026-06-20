"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { NextStepAction } from "../_lib/types";

export type GrowthTrackDialogMode =
  | "assign_cell_group"
  | "assign_life_group"
  | "enroll_discipleship";

interface GrowthTrackActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  mode: GrowthTrackDialogMode;
  options: { id: string; label: string }[];
  hint?: string;
  isSaving: boolean;
  onConfirm: (selectedId: string) => Promise<void>;
}

export function GrowthTrackActionDialog({
  open,
  onOpenChange,
  personName,
  mode,
  options,
  hint,
  isSaving,
  onConfirm,
}: GrowthTrackActionDialogProps) {
  const [selectedId, setSelectedId] = useState("");

  const titles: Record<GrowthTrackDialogMode, string> = {
    assign_cell_group: "Assign to Cell Group",
    assign_life_group: "Assign to Life Group",
    enroll_discipleship: "Enroll in Discipleship",
  };

  const descriptions: Record<GrowthTrackDialogMode, string> = {
    assign_cell_group: `Choose a cell group for ${personName}. Groups with a leader are listed first.`,
    assign_life_group: `Choose a life group for ${personName}.`,
    enroll_discipleship: `Choose a discipleship track for ${personName}.`,
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    await onConfirm(selectedId);
    setSelectedId("");
    onOpenChange(false);
  };

  const fieldLabel =
    mode === "enroll_discipleship" ? "Track" : "Group";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titles[mode]}</DialogTitle>
          <DialogDescription>{descriptions[mode]}</DialogDescription>
          {hint ? (
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {hint}
            </p>
          ) : null}
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label>{fieldLabel}</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            disabled={!selectedId || isSaving}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function isDialogAction(
  action: NextStepAction["action"],
): action is GrowthTrackDialogMode {
  return (
    action === "assign_cell_group" ||
    action === "assign_life_group" ||
    action === "enroll_discipleship"
  );
}
