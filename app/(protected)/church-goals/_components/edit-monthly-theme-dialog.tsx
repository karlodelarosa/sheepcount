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
import { Calendar } from "lucide-react";
import { MONTH_NAMES, type MonthlyTheme } from "@/lib/supabase/church-goals";

interface EditMonthlyThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: MonthlyTheme | null;
  year: number;
  month: number;
  isSaving?: boolean;
  onSave: (data: {
    title: string;
    description: string;
    content: string;
  }) => void | Promise<void>;
}

export function EditMonthlyThemeDialog({
  open,
  onOpenChange,
  theme,
  year,
  month,
  isSaving = false,
  onSave,
}: EditMonthlyThemeDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(theme?.title ?? "");
      setDescription(theme?.description ?? "");
      setContent(theme?.content ?? "");
    }
  }, [open, theme]);

  const monthName = MONTH_NAMES[month - 1];

  const handleSave = async () => {
    if (!title.trim()) return;
    await onSave({ title, description, content });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-slate-200/60 bg-white dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-2.5 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {theme ? "Edit" : "Add"} {monthName} {year} Theme
              </DialogTitle>
              <DialogDescription>
                Set the monthly title, description, and optional bullet points.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="theme-title">Title</Label>
            <Input
              id="theme-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. New Beginnings in Christ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-description">Description</Label>
            <Textarea
              id="theme-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief overview of this month's focus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-content">Formatted content</Label>
            <Textarea
              id="theme-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              placeholder={"Optional bullet points, one per line:\n- Point one\n- Point two"}
            />
            <p className="text-xs text-muted-foreground">
              Start lines with -, •, or * for bullet points.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!title.trim() || isSaving}
          >
            Save Theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
