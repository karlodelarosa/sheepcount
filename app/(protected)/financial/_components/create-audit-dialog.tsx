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
import { todayDateString } from "../_lib/dates";
import type { NewAuditSchedule } from "../_lib/types";

interface CreateAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (schedule: NewAuditSchedule) => void;
}

export function CreateAuditDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateAuditDialogProps) {
  const [title, setTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState(todayDateString());

  const resetAndClose = () => {
    setTitle("");
    setScheduleDate(todayDateString());
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), scheduleDate });
    resetAndClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) resetAndClose();
        else onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-[480px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Create audit schedule</DialogTitle>
          <DialogDescription>
            Name this audit period (e.g. &ldquo;June 2026 - Audit&rdquo;) and
            set the schedule date. You can change entry dates later for late
            inputs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="audit-title">Title</Label>
              <Input
                id="audit-title"
                placeholder="June 2026 - Audit"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="rounded-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit-schedule-date">Schedule date</Label>
              <Input
                id="audit-schedule-date"
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="rounded-lg"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              Create schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
