// _components/add-program-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen } from "lucide-react";

interface AddProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProgramDialog({ open, onOpenChange }: AddProgramDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");

  const handleCreate = () => {
    if (name && category && duration) {
      console.log("Creating new program:", { name, description, category, duration });
      // In a real application, you would make an API call here.

      // Reset state and close
      setName("");
      setDescription("");
      setCategory("");
      setDuration("");
      onOpenChange(false);
    }
  };

  // Dual-Mode Classes
  const DualModePrimaryButtonClass = "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";
  const DualModeInputClass = "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeLabelClass = "text-slate-700 dark:text-zinc-300";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] dark:bg-zinc-800 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5"/> Create New Program
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Define a new discipleship track or study program.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={DualModeLabelClass}>Program Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className={DualModeInputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className={DualModeLabelClass}>Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={DualModeInputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className={DualModeLabelClass}>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className={DualModeInputClass}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Foundations">Foundations</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Advanced">Advanced Study</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className={DualModeLabelClass}>Duration (e.g., 6 weeks) *</Label>
              <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className={DualModeInputClass} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleCreate}
            disabled={!name || !category || !duration}
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