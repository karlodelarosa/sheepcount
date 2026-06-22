"use client";

import { useMemo, useState } from "react";
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
import { Loader2, UserPlus } from "lucide-react";
import { usePeople } from "@/lib/people";

interface AddExistingHouseholdMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  householdName: string;
}

export function AddExistingHouseholdMemberDialog({
  open,
  onOpenChange,
  householdId,
  householdName,
}: AddExistingHouseholdMemberDialogProps) {
  const { people, assignToHousehold, isSaving } = usePeople();
  const [personId, setPersonId] = useState("");
  const [role, setRole] = useState("");

  const availablePeople = useMemo(
    () =>
      [...people]
        .filter(p => p.householdId !== householdId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [people, householdId],
  );

  const resetForm = () => {
    setPersonId("");
    setRole("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId || !role) return;

    const person = await assignToHousehold(personId, householdId, role);
    if (person) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px] border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Existing Member
          </DialogTitle>
          <DialogDescription>
            Choose someone from your directory to add to {householdName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Person</Label>
              <Select
                value={personId}
                onValueChange={setPersonId}
                disabled={isSaving}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Choose a person" />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No available people
                    </SelectItem>
                  ) : (
                    availablePeople.map(person => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                        {person.householdName
                          ? ` · ${person.householdName}`
                          : " · No household"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role in Family</Label>
              <Select
                value={role}
                onValueChange={setRole}
                disabled={isSaving}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Head">Head</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
              disabled={
                isSaving || !personId || !role || availablePeople.length === 0
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Household"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
