"use client";

import { useEffect, useState } from "react";
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
import { Target, Plus, Trash2 } from "lucide-react";
import type { YearlyGoal } from "@/lib/supabase/church-goals";

type ObjectiveDraft = {
  text: string;
  isCompleted: boolean;
};

export type YearlyGoalFormData = {
  year: number;
  theme: string;
  title: string;
  description: string;
  vision: string;
  objectives: ObjectiveDraft[];
};

function emptyForm(year: number): YearlyGoalFormData {
  return {
    year,
    theme: "",
    title: "",
    description: "",
    vision: "",
    objectives: [{ text: "", isCompleted: false }],
  };
}

function goalToForm(goal: YearlyGoal | null, year: number): YearlyGoalFormData {
  if (!goal) return emptyForm(year);
  return {
    year: goal.year,
    theme: goal.theme,
    title: goal.title,
    description: goal.description,
    vision: goal.vision,
    objectives:
      goal.objectives.length > 0
        ? goal.objectives.map(o => ({
            text: o.text,
            isCompleted: o.isCompleted,
          }))
        : [{ text: "", isCompleted: false }],
  };
}

interface EditYearlyGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: YearlyGoal | null;
  year: number;
  isSaving?: boolean;
  onSave: (data: YearlyGoalFormData) => void | Promise<void>;
}

export function EditYearlyGoalDialog({
  open,
  onOpenChange,
  goal,
  year,
  isSaving = false,
  onSave,
}: EditYearlyGoalDialogProps) {
  const [form, setForm] = useState<YearlyGoalFormData>(() =>
    goalToForm(goal, year),
  );

  useEffect(() => {
    if (open) {
      setForm(goalToForm(goal, year));
    }
  }, [open, goal, year]);

  const updateField = <K extends keyof YearlyGoalFormData>(
    key: K,
    value: YearlyGoalFormData[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateObjective = (index: number, text: string) => {
    setForm(prev => ({
      ...prev,
      objectives: prev.objectives.map((o, i) =>
        i === index ? { ...o, text } : o,
      ),
    }));
  };

  const addObjective = () => {
    setForm(prev => ({
      ...prev,
      objectives: [...prev.objectives, { text: "", isCompleted: false }],
    }));
  };

  const removeObjective = (index: number) => {
    setForm(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() && !form.theme.trim()) return;
    await onSave(form);
    onOpenChange(false);
  };

  const isValid =
    form.title.trim().length > 0 || form.theme.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto border-slate-200/60 bg-white dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 dark:bg-purple-900/30 p-2.5 text-purple-600 dark:text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {goal ? `Edit ${year} Church Goal` : `Set up ${year} Church Goal`}
              </DialogTitle>
              <DialogDescription>
                Define the yearly theme, vision, and key objectives. Use the
                menu on the goal card for the year-end retrospective.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-theme">Yearly Theme</Label>
              <Input
                id="goal-theme"
                value={form.theme}
                onChange={e => updateField("theme", e.target.value)}
                placeholder="e.g. Building Strong Foundations"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                value={form.title}
                onChange={e => updateField("title", e.target.value)}
                placeholder="e.g. 2026 Church Vision"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-description">Description</Label>
            <Textarea
              id="goal-description"
              value={form.description}
              onChange={e => updateField("description", e.target.value)}
              rows={2}
              placeholder="Short summary of this year's focus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-vision">Vision Statement</Label>
            <Textarea
              id="goal-vision"
              value={form.vision}
              onChange={e => updateField("vision", e.target.value)}
              rows={4}
              placeholder="The overall vision for the church this year"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Key Objectives</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 h-8"
                onClick={addObjective}
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {form.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={objective.text}
                    onChange={e => updateObjective(index, e.target.value)}
                    placeholder={`Objective ${index + 1}`}
                  />
                  {form.objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeObjective(index)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!isValid || isSaving}
          >
            Save Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
