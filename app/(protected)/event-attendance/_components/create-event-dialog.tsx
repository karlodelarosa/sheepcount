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
import type { CreateEventInput, EventCategory, EventType } from "@/lib/event-attendance";

const eventTypes: EventType[] = [
  "Retreat",
  "Youth Camp",
  "Conference",
  "Outreach",
  "Workshop",
  "Other",
];

const eventCategories: EventCategory[] = [
  "Youth",
  "Children",
  "Adults",
  "All Ages",
  "Outreach",
];

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateEventInput) => void;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateEventDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("Retreat");
  const [category, setCategory] = useState<EventCategory>("Youth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
    setType("Retreat");
    setCategory("Youth");
    setStartDate("");
    setEndDate("");
    setLocation("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    onCreate({
      name,
      description,
      type,
      category,
      startDate,
      endDate: endDate || startDate,
      location,
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
            Set up a retreat, camp, conference, or any special gathering
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Event Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
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

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={v => setType(v as EventType)}>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={category}
                onValueChange={v => setCategory(v as EventCategory)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Camp Riverside, Fellowship Hall..."
              className="h-8 text-sm"
            />
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
            <Button type="submit" size="sm">
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
