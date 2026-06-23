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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonSelect } from "@/components/person-select";
import { Input } from "@/components/ui/input";
import { usePeople } from "@/lib/people";
import { useLeadership } from "@/lib/leadership";

const POSITION_OPTIONS = [
  "Head Pastor",
  "Secretary",
  "Treasurer",
  "Deacon",
  "Elder",
  "Trustee",
  "Worship Team Lead",
  "Christian Education Head",
  "Outreach Coordinator",
];

interface AssignAdminPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignAdminPositionDialog({
  open,
  onOpenChange,
}: AssignAdminPositionDialogProps) {
  const { people } = usePeople();
  const { assignAdminPosition, isSaving } = useLeadership();
  const [formData, setFormData] = useState({
    personId: "",
    title: "",
    term: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await assignAdminPosition({
      title: formData.title,
      personId: formData.personId,
      term: formData.term,
    });

    if (!result) return;

    onOpenChange(false);
    setFormData({ personId: "", title: "", term: "" });
  };

  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";

  const DualModeOutlineButtonClass =
    "rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700";

  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";

  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Assign Administrative Position
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Appoint a person to an administrative role in your organization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="position-title"
                className="text-slate-700 dark:text-zinc-300"
              >
                Position
              </Label>
              <Select
                value={formData.title}
                onValueChange={value =>
                  setFormData({ ...formData, title: value })
                }
                required
              >
                <SelectTrigger className={`rounded-lg ${DualModeInputClass}`}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map(title => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="person"
                className="text-slate-700 dark:text-zinc-300"
              >
                Select Person
              </Label>
              <PersonSelect
                people={sortedPeople}
                value={formData.personId}
                onValueChange={value =>
                  setFormData({ ...formData, personId: value })
                }
                placeholder="Choose a person"
                triggerClassName={`rounded-lg ${DualModeInputClass}`}
                formatLabel={person =>
                  person.householdName
                    ? `${person.name} - ${person.householdName}`
                    : person.name
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="term"
                className="text-slate-700 dark:text-zinc-300"
              >
                Term (e.g., 2025-2027)
              </Label>
              <Input
                id="term"
                placeholder="2025-2027 or Permanent"
                value={formData.term}
                onChange={e =>
                  setFormData({ ...formData, term: e.target.value })
                }
                className={`rounded-lg ${DualModeInputClass}`}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={DualModeOutlineButtonClass}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={DualModePrimaryButtonClass}
              disabled={
                isSaving ||
                !formData.title ||
                !formData.personId ||
                !formData.term
              }
            >
              {isSaving ? "Assigning..." : "Assign Position"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
