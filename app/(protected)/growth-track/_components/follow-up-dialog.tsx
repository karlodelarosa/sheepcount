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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { FollowUpMethod } from "@/lib/growth-track/types";

export type { FollowUpMethod };

export const FOLLOW_UP_METHODS: { value: FollowUpMethod; label: string }[] = [
  { value: "text_message", label: "Text message" },
  { value: "phone_call", label: "Phone call" },
  { value: "in_person", label: "In person" },
  { value: "social_media", label: "Social media" },
  { value: "other", label: "Other" },
];

interface FollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  isSaving: boolean;
  onConfirm: (method: FollowUpMethod, notes: string) => Promise<void>;
}

export function FollowUpDialog({
  open,
  onOpenChange,
  personName,
  isSaving,
  onConfirm,
}: FollowUpDialogProps) {
  const [method, setMethod] = useState<FollowUpMethod>("text_message");
  const [notes, setNotes] = useState("");

  const handleConfirm = async () => {
    await onConfirm(method, notes.trim());
    setMethod("text_message");
    setNotes("");
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMethod("text_message");
      setNotes("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Followed Up</DialogTitle>
          <DialogDescription>
            Log how you followed up with {personName}. They will move to the
            next step in the growth track.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>How did you follow up?</Label>
            <Select
              value={method}
              onValueChange={value => setMethod(value as FollowUpMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_METHODS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-up-notes">Notes (optional)</Label>
            <Textarea
              id="follow-up-notes"
              placeholder="What was discussed, next steps, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleConfirm()} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Mark as Followed Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
