"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen } from "lucide-react";
import type { Person } from "@/lib/people";
import type {
  CreateDiscipleshipTrackInput,
  DiscipleshipCategory,
  DiscipleshipTrack,
} from "@/lib/supabase/discipleship";

interface AddProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  isSaving: boolean;
  onCreate: (input: CreateDiscipleshipTrackInput) => Promise<DiscipleshipTrack | null>;
}

const CATEGORIES: DiscipleshipCategory[] = [
  "Foundation",
  "Growth",
  "Leadership",
  "Mentorship",
];

const COLORS = ["blue", "green", "purple", "pink", "indigo"];

export function AddProgramDialog({
  open,
  onOpenChange,
  people,
  isSaving,
  onCreate,
}: AddProgramDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DiscipleshipCategory | "">("");
  const [duration, setDuration] = useState("");
  const [schedule, setSchedule] = useState("");
  const [leaderPersonId, setLeaderPersonId] = useState("");
  const [color, setColor] = useState("blue");

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setDuration("");
    setSchedule("");
    setLeaderPersonId("");
    setColor("blue");
  };

  const handleCreate = async () => {
    if (!name || !category || !duration) return;

    const track = await onCreate({
      name,
      description,
      category,
      duration,
      schedule,
      leaderPersonId: leaderPersonId || undefined,
      color,
    });

    if (track) {
      resetForm();
      onOpenChange(false);
    }
  };

  const DualModePrimaryButtonClass = "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass = "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeLabelClass = "text-slate-700 dark:text-zinc-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] dark:bg-zinc-800 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Create New Program
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Define a new discipleship track or study program.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={DualModeLabelClass}>Program Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={DualModeInputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className={DualModeLabelClass}>Description</Label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={DualModeInputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className={DualModeLabelClass}>Category *</Label>
              <Select
                value={category}
                onValueChange={v => setCategory(v as DiscipleshipCategory)}
              >
                <SelectTrigger id="category" className={DualModeInputClass}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className={DualModeLabelClass}>Duration *</Label>
              <Input
                id="duration"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g., 8 weeks"
                className={DualModeInputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule" className={DualModeLabelClass}>Schedule</Label>
            <Input
              id="schedule"
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              placeholder="e.g., Sundays, 9:00 AM"
              className={DualModeInputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leader" className={DualModeLabelClass}>Leader</Label>
              <Select value={leaderPersonId} onValueChange={setLeaderPersonId}>
                <SelectTrigger id="leader" className={DualModeInputClass}>
                  <SelectValue placeholder="Select leader" />
                </SelectTrigger>
                <SelectContent>
                  {people.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color" className={DualModeLabelClass}>Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger id="color" className={DualModeInputClass}>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map(c => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => void handleCreate()}
            disabled={!name || !category || !duration || isSaving}
            className={DualModePrimaryButtonClass}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
