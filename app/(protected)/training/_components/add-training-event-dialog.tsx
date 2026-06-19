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
import { useTraining } from "@/lib/training";
import type { TrainingCategory } from "@/lib/supabase/training";

interface AddTrainingCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AddTrainingCourseDialog({
  open,
  onOpenChange,
}: AddTrainingCourseDialogProps) {
  const { addCourse } = useTraining();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Leadership" as TrainingCategory,
    slug: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug.trim() || slugify(formData.name);
    const result = await addCourse({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      slug,
    });
    if (result) {
      onOpenChange(false);
      setFormData({ name: "", description: "", category: "Leadership", slug: "" });
    }
  };

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white";
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
  const DualModeDialogClass =
    "bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[600px] ${DualModeDialogClass}`}>
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Add Training Course</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Create a competency-based course with sequential modules
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-name" className="text-slate-700 dark:text-zinc-300">
                Course Name
              </Label>
              <Input
                id="course-name"
                placeholder="e.g., Cell Leadership 101"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={DualModeInputClass}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 dark:text-zinc-300">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the course"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={DualModeInputClass}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 dark:text-zinc-300">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      category: value as TrainingCategory,
                    })
                  }
                >
                  <SelectTrigger className={DualModeInputClass}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ministry">Ministry</SelectItem>
                    <SelectItem value="Life Skills">Life Skills</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Worship">Worship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-slate-700 dark:text-zinc-300">
                  Slug (optional)
                </Label>
                <Input
                  id="slug"
                  placeholder="cell-leadership-101"
                  value={formData.slug}
                  onChange={e =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className={DualModeInputClass}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
            >
              Cancel
            </Button>
            <Button type="submit" className={DualModePrimaryButtonClass}>
              Create Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
