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
import { Input } from "@/components/ui/input";
import { mockPeople } from "@/components/mock-data";

interface AssignAdminPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignAdminPositionDialog({
  open,
  onOpenChange,
}: AssignAdminPositionDialogProps) {
  const [formData, setFormData] = useState({
    personId: "",
    title: "",
    term: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Assigning admin position:", formData);
    onOpenChange(false);
    setFormData({ personId: "", title: "", term: "" });
  };

  // Dual-Mode Primary Button Class
  const DualModePrimaryButtonClass =
    "rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-700";

  // Dual-Mode Outline Button Class
  const DualModeOutlineButtonClass =
    "rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700";

  // Dual-Mode Input/Select Class
  const DualModeInputClass =
    "rounded-lg bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent: Dual Mode Styling */}
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
              >
                <SelectTrigger className={`rounded-lg ${DualModeInputClass}`}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                {/* SelectContent component relies on global styling, ensure it supports dark mode */}
                <SelectContent>
                  <SelectItem value="Secretary">Secretary</SelectItem>
                  <SelectItem value="Treasurer">Treasurer</SelectItem>
                  <SelectItem value="Deacon">Deacon</SelectItem>
                  <SelectItem value="Elder">Elder</SelectItem>
                  <SelectItem value="Trustee">Trustee</SelectItem>
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
              <Select
                value={formData.personId}
                onValueChange={value =>
                  setFormData({ ...formData, personId: value })
                }
              >
                <SelectTrigger className={`rounded-lg ${DualModeInputClass}`}>
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                {/* SelectContent component relies on global styling, ensure it supports dark mode */}
                <SelectContent>
                  {mockPeople.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} - {person.householdName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                placeholder="2025-2027"
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
            >
              Cancel
            </Button>
            <Button type="submit" className={DualModePrimaryButtonClass}>
              Assign Position
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
