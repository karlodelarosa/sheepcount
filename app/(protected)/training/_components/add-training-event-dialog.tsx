"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddTrainingEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTrainingEventDialog({ open, onOpenChange }: AddTrainingEventDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    duration: "",
    instructor: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding training event:", formData);
    onOpenChange(false);
    setFormData({ name: "", description: "", date: "", duration: "", instructor: "", category: "" });
  };

  // Dual-Mode Primary Button (using purple/slate for contrast)
  const DualModePrimaryButtonClass = "rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white";
  
  // Dual-Mode Input/Textarea/Select Class
  const DualModeInputClass = "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  
  // Dual-Mode Dialog Content
  const DualModeDialogClass = "bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white";


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[600px] ${DualModeDialogClass}`}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Add Training Event</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Create a new training program or event
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="training-name" className="text-slate-700 dark:text-zinc-300">Training Name</Label>
              <Input
                id="training-name"
                placeholder="e.g., Leadership Fundamentals"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={DualModeInputClass}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 dark:text-zinc-300">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the training content"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={DualModeInputClass}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-700 dark:text-zinc-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={DualModeInputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-slate-700 dark:text-zinc-300">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 2 hours"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={DualModeInputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instructor" className="text-slate-700 dark:text-zinc-300">Instructor</Label>
                <Input
                  id="instructor"
                  placeholder="Instructor name"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className={DualModeInputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 dark:text-zinc-300">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className={DualModeInputClass}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Worship">Worship</SelectItem>
                    <SelectItem value="Ministry">Ministry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50">
              Cancel
            </Button>
            <Button type="submit" className={DualModePrimaryButtonClass}>
              Create Training Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}