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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChurchEventType, CreateChurchEventInput } from "@/lib/supabase/events";

const eventTypes: ChurchEventType[] = ["VBS", "Camp", "Retreat", "Conference"];

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateChurchEventInput) => void | Promise<void>;
  isSaving?: boolean;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onCreate,
  isSaving = false,
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChurchEventType>("Retreat");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setType("Retreat");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    await onCreate({
      title,
      description,
      type,
      startDate,
      endDate: endDate || startDate,
      status: "published",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Create Event</DialogTitle>
          <DialogDescription className="text-xs">
            Set up a VBS, camp, retreat, or conference to track session attendance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Event Title</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Youth Summer Camp 2025"
              required
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the event..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={v => setType(v as ChurchEventType)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                required
                className="h-8 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
