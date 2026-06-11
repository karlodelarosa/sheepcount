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
import { Award } from "lucide-react";

interface Ministry {
  id: string;
  name: string;
  description: string;
}

interface AssignMinistryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  ministries: Ministry[];
  assignedMinistryIds: string[];
  onAssign: (ministryId: string, role: string) => void;
}

export function AssignMinistryDialog({
  open,
  onOpenChange,
  personName,
  ministries,
  assignedMinistryIds,
  onAssign,
}: AssignMinistryDialogProps) {
  const [ministryId, setMinistryId] = useState("");
  const [role, setRole] = useState("");

  const availableMinistries = ministries.filter(
    m => !assignedMinistryIds.includes(m.id),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministryId || !role) return;
    onAssign(ministryId, role);
    setMinistryId("");
    setRole("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Assign to Ministry
          </DialogTitle>
          <DialogDescription>
            Assign {personName} to a work ministry
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Ministry</Label>
            <Select value={ministryId} onValueChange={setMinistryId} required>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select ministry" />
              </SelectTrigger>
              <SelectContent>
                {availableMinistries.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    All ministries assigned
                  </SelectItem>
                ) : (
                  availableMinistries.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Team Lead">Team Lead</SelectItem>
                <SelectItem value="Coordinator">Coordinator</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!ministryId || !role}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              Assign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
