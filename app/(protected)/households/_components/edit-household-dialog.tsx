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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { usePeople, type Household, type Person } from "@/lib/people";

interface EditHouseholdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  household: Household;
  members: Person[];
  currentHead?: Person;
}

export function EditHouseholdDialog({
  open,
  onOpenChange,
  household,
  members,
  currentHead,
}: EditHouseholdDialogProps) {
  const { updateHouseholdDetails, isSaving } = usePeople();
  const [name, setName] = useState(household.name);
  const [address, setAddress] = useState(household.address);
  const [headPersonId, setHeadPersonId] = useState(currentHead?.id ?? "");

  useEffect(() => {
    if (!open) return;
    setName(household.name);
    setAddress(household.address);
    setHeadPersonId(currentHead?.id ?? "");
  }, [open, household, currentHead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateHouseholdDetails(household.id, {
      name,
      address,
      headPersonId: headPersonId || undefined,
    });
    if (result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle>Edit Household</DialogTitle>
          <DialogDescription>
            Update household details, address, and head of family.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="household-name">Household Name</Label>
              <Input
                id="household-name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={isSaving}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="household-address">Address</Label>
              <Textarea
                id="household-address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={3}
                disabled={isSaving}
                className="rounded-lg"
                placeholder="Street address, city, state, ZIP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="household-head">Head of Family</Label>
              {members.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-500">
                  Add church members to this household first, then assign a head.
                </p>
              ) : (
                <Select
                  value={headPersonId}
                  onValueChange={setHeadPersonId}
                  disabled={isSaving}
                >
                  <SelectTrigger id="household-head" className="rounded-lg">
                    <SelectValue placeholder="Select head of household" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                        {member.role === "Head" ? " (current head)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
