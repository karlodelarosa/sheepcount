"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Plus,
  Trash2,
  ThumbsUp,
  AlertCircle,
  ListTodo,
} from "lucide-react";
import {
  getRetrospectiveItems,
  type YearlyGoal,
} from "@/lib/supabase/church-goals";
import { cn } from "@/lib/utils";

export type RetrospectiveFormData = {
  wentWell: string[];
  couldBeBetter: string[];
  actionPoints: string[];
};

function goalToRetrospectiveForm(goal: YearlyGoal | null): RetrospectiveFormData {
  if (!goal) {
    return { wentWell: [""], couldBeBetter: [""], actionPoints: [""] };
  }

  const toLines = (category: "went_well" | "could_be_better" | "action_point") => {
    const items = getRetrospectiveItems(goal, category).map(item => item.text);
    return items.length > 0 ? items : [""];
  };

  return {
    wentWell: toLines("went_well"),
    couldBeBetter: toLines("could_be_better"),
    actionPoints: toLines("action_point"),
  };
}

function RetrospectiveSection({
  icon: Icon,
  title,
  description,
  accent,
  items,
  isAdmin,
  onChange,
  onAdd,
  onRemove,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: "emerald" | "amber" | "violet";
  items: string[];
  isAdmin: boolean;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const styles = {
    emerald: {
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      icon: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/60 dark:border-emerald-800/40",
    },
    amber: {
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      icon: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200/60 dark:border-amber-800/40",
    },
    violet: {
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
      icon: "text-violet-600 dark:text-violet-400",
      border: "border-violet-200/60 dark:border-violet-800/40",
    },
  }[accent];

  const filledItems = items.filter(item => item.trim());

  return (
    <section
      className={cn(
        "rounded-xl border p-4 space-y-3",
        styles.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("mt-0.5", styles.icon)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm">{title}</h3>
              <Badge variant="secondary" className={cn("text-[10px]", styles.badge)}>
                {filledItems.length} {filledItems.length === 1 ? "item" : "items"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        {isAdmin && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 shrink-0"
            onClick={onAdd}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {isAdmin ? (
          items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={e => onChange(index, e.target.value)}
                placeholder={`${title} ${index + 1}`}
              />
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))
        ) : filledItems.length > 0 ? (
          <ul className="space-y-2">
            {filledItems.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No items yet.</p>
        )}
      </div>
    </section>
  );
}

interface RetrospectiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: YearlyGoal | null;
  year: number;
  isAdmin: boolean;
  isSaving?: boolean;
  onSave: (data: RetrospectiveFormData) => void | Promise<void>;
}

export function RetrospectiveSheet({
  open,
  onOpenChange,
  goal,
  year,
  isAdmin,
  isSaving = false,
  onSave,
}: RetrospectiveSheetProps) {
  const [form, setForm] = useState<RetrospectiveFormData>(() =>
    goalToRetrospectiveForm(goal),
  );

  useEffect(() => {
    if (open) {
      setForm(goalToRetrospectiveForm(goal));
    }
  }, [open, goal]);

  const updateList = (
    key: keyof RetrospectiveFormData,
    index: number,
    value: string,
  ) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addToList = (key: keyof RetrospectiveFormData) => {
    setForm(prev => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const removeFromList = (key: keyof RetrospectiveFormData, index: number) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    await onSave({
      wentWell: form.wentWell.filter(t => t.trim()),
      couldBeBetter: form.couldBeBetter.filter(t => t.trim()),
      actionPoints: form.actionPoints.filter(t => t.trim()),
    });
    onOpenChange(false);
  };

  const totalItems =
    form.wentWell.filter(t => t.trim()).length +
    form.couldBeBetter.filter(t => t.trim()).length +
    form.actionPoints.filter(t => t.trim()).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 dark:bg-zinc-800 p-2.5 text-slate-600 dark:text-zinc-300">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle>{year} year-end retrospective</SheetTitle>
              <SheetDescription>
                Capture what went well, what to improve, and action points for
                next year.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <RetrospectiveSection
            icon={ThumbsUp}
            title="What went well"
            description="Wins, milestones, and positive outcomes from the year."
            accent="emerald"
            items={form.wentWell}
            isAdmin={isAdmin}
            onChange={(index, value) => updateList("wentWell", index, value)}
            onAdd={() => addToList("wentWell")}
            onRemove={index => removeFromList("wentWell", index)}
          />

          <RetrospectiveSection
            icon={AlertCircle}
            title="What could have been better"
            description="Challenges, gaps, and lessons learned."
            accent="amber"
            items={form.couldBeBetter}
            isAdmin={isAdmin}
            onChange={(index, value) =>
              updateList("couldBeBetter", index, value)
            }
            onAdd={() => addToList("couldBeBetter")}
            onRemove={index => removeFromList("couldBeBetter", index)}
          />

          <RetrospectiveSection
            icon={ListTodo}
            title="Action points"
            description="Specific follow-ups to carry into next year's planning."
            accent="violet"
            items={form.actionPoints}
            isAdmin={isAdmin}
            onChange={(index, value) => updateList("actionPoints", index, value)}
            onAdd={() => addToList("actionPoints")}
            onRemove={index => removeFromList("actionPoints", index)}
          />
        </div>

        {isAdmin ? (
          <SheetFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={isSaving || !goal}
            >
              Save retrospective
            </Button>
          </SheetFooter>
        ) : (
          <p className="text-xs text-muted-foreground text-center pb-2">
            {totalItems > 0
              ? `${totalItems} retrospective items recorded`
              : "No retrospective items recorded yet"}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function getRetrospectiveItemCount(goal: YearlyGoal | null): number {
  if (!goal) return 0;
  return goal.retrospective.length;
}
