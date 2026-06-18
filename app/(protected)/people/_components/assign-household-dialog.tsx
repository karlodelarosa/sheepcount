"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home } from "lucide-react";
import type { Household } from "@/lib/people";

interface AssignHouseholdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  households: Household[];
  currentHouseholdId?: string;
  canRemoveFromHousehold?: boolean;
  onAssign: (householdId: string, role: string) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
}

export function AssignHouseholdDialog({
  open,
  onOpenChange,
  personName,
  households,
  currentHouseholdId,
  canRemoveFromHousehold = false,
  onAssign,
  onRemove,
}: AssignHouseholdDialogProps) {
  const [householdId, setHouseholdId] = useState(currentHouseholdId ?? "");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId || !role || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAssign(householdId, role);
      setRole("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRemove();
      setHouseholdId("");
      setRole("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (open) {
          setHouseholdId(
            canRemoveFromHousehold ? (currentHouseholdId ?? "") : "",
          );
          setRole("");
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Assign to Household
          </DialogTitle>
          <DialogDescription>
            Link {personName} to a family household group
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Household</Label>
            <Select value={householdId} onValueChange={setHouseholdId} required>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select household" />
              </SelectTrigger>
              <SelectContent>
                {households.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No other households available. Create one from the
                    Households page first.
                  </div>
                ) : (
                  households.map(h => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Role in Family</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Head">Head of Household</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between gap-3">
            {canRemoveFromHousehold && currentHouseholdId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={isSubmitting}
                className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Remove from Household
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!householdId || !role || isSubmitting || households.length === 0}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
              >
                {isSubmitting ? "Saving…" : "Assign"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
