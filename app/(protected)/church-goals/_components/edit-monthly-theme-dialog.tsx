"use client";

import { getThemePeriods, type ThemeCadence } from "@/lib/church-theme-periods";
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
import { type MonthlyTheme } from "@/lib/supabase/church-goals";

interface EditMonthlyThemeDialogProps {
  cadence?: ThemeCadence;
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
  cadence = "monthly",
  open,
  onOpenChange,
  theme,
  year,
  month,
  isSaving = false,
  onSave,
}: EditMonthlyThemeDialogProps) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open) {
      setSaveError(null);
      setTitle(theme?.title ?? "");
      setDescription(theme?.description ?? "");
      setContent(theme?.content ?? "");
    }
  }, [open, theme]);

  const monthName = getThemePeriods(cadence)[month - 1]?.name;

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaveError(null);
    try {
      await onSave({ title, description, content });
      onOpenChange(false);
    } catch {
      setSaveError("Theme could not be saved. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-border/70 bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--accent-color-soft)] p-2.5 text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {theme ? "Edit" : "Add"} {monthName} {year} Theme
              </DialogTitle>
              <DialogDescription>
                Set the {cadence} title, description, and optional bullet
                points.
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
              placeholder="Brief overview of this period’s focus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-content">Formatted content</Label>
            <Textarea
              id="theme-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              placeholder={
                "Optional bullet points, one per line:\n- Point one\n- Point two"
              }
            />
            <p className="text-xs text-muted-foreground">
              Start lines with -, •, or * for bullet points.
            </p>
          </div>
        </div>

        {saveError && (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="accent"
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
