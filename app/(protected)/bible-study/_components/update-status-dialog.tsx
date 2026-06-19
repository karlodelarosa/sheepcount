"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBibleStudy } from "@/lib/bible-study";
import type { BibleStudyGroup, BibleStudyStatus } from "@/lib/supabase/bible-study";

const STATUS_OPTIONS: { value: BibleStudyStatus; label: string; description: string }[] = [
  { value: "active", label: "Active", description: "Group is currently meeting" },
  { value: "completed", label: "Completed", description: "Bible study finished successfully" },
  { value: "paused", label: "Paused", description: "Temporarily on hold" },
  { value: "cancelled", label: "Cancelled", description: "Ended due to unforeseen circumstances" },
];

interface UpdateBibleStudyStatusDialogProps {
  group: BibleStudyGroup;
  householdName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function UpdateBibleStudyStatusDialog({
  group,
  householdName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: UpdateBibleStudyStatusDialogProps) {
  const { updateGroupStatus, isSaving } = useBibleStudy();
  const [internalOpen, setInternalOpen] = useState(false);
  const [status, setStatus] = useState<BibleStudyStatus>(group.status);
  const [statusNotes, setStatusNotes] = useState(group.statusNotes);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(open);
    } else {
      setInternalOpen(open);
    }
    if (open) {
      setStatus(group.status);
      setStatusNotes(group.statusNotes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateGroupStatus(
      group.id,
      status,
      status === "paused" || status === "cancelled" ? statusNotes : undefined,
    );
    if (result) {
      handleOpenChange(false);
    }
  };

  const selectedOption = STATUS_OPTIONS.find(o => o.value === status);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Bible Study Status</DialogTitle>
          <DialogDescription>
            Change the status for {householdName}&apos;s Bible study group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as BibleStudyStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOption && (
              <p className="text-sm text-muted-foreground">{selectedOption.description}</p>
            )}
          </div>

          {(status === "paused" || status === "cancelled") && (
            <div className="grid gap-2">
              <Label htmlFor="statusNotes">Notes (optional)</Label>
              <Textarea
                id="statusNotes"
                placeholder="Reason for pause or cancellation..."
                value={statusNotes}
                onChange={e => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              Save Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
