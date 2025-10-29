"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPeople, mockTrainingEvents } from "@/components/mock-data";

interface RecordTrainingCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingId: string | null;
}

export function RecordTrainingCompletionDialog({ open, onOpenChange, trainingId }: RecordTrainingCompletionDialogProps) {
  const [formData, setFormData] = useState({
    personId: "",
    completedDate: "",
    score: "",
    certified: false,
  });

  const training = mockTrainingEvents.find(t => t.id === trainingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Recording training completion:", { trainingId, ...formData });
    onOpenChange(false);
    setFormData({ personId: "", completedDate: "", score: "", certified: false });
  };
  
  // Dual-Mode Primary Button (using purple/slate for contrast)
  const DualModePrimaryButtonClass = "rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white";
  
  // Dual-Mode Input/Select Class
  const DualModeInputClass = "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  
  // Dual-Mode Dialog Content
  const DualModeDialogClass = "bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white";


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[500px] ${DualModeDialogClass}`}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Record Training Completion</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            {training ? `Mark completion for ${training.name}` : "Record a person's training completion"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="person" className="text-slate-700 dark:text-zinc-300">Select Person</Label>
              <Select value={formData.personId} onValueChange={(value) => setFormData({ ...formData, personId: value })}>
                <SelectTrigger className={DualModeInputClass}>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {mockPeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} - {person.householdName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="completion-date" className="text-slate-700 dark:text-zinc-300">Completion Date</Label>
                <Input
                  id="completion-date"
                  type="date"
                  value={formData.completedDate}
                  onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                  className={DualModeInputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="score" className="text-slate-700 dark:text-zinc-300">Score (optional)</Label>
                <Input
                  id="score"
                  placeholder="e.g., 95%"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className={DualModeInputClass}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Checkbox styling relies on base component implementation */}
              <Checkbox
                id="certified"
                checked={formData.certified}
                onCheckedChange={(checked) => setFormData({ ...formData, certified: checked as boolean })}
              />
              <Label htmlFor="certified" className="cursor-pointer text-slate-700 dark:text-zinc-300">
                Mark as certified
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50">
              Cancel
            </Button>
            <Button type="submit" className={DualModePrimaryButtonClass}>
              Record Completion
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}