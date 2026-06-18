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
import {
  usePeople,
  type HouseholdOtherResident,
  type OtherResidentRelation,
} from "@/lib/people";

const RELATIONS: OtherResidentRelation[] = [
  "Tenant",
  "Friend",
  "Relative",
  "Other",
];

interface OtherResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  householdName: string;
  resident?: HouseholdOtherResident | null;
}

export function OtherResidentDialog({
  open,
  onOpenChange,
  householdId,
  householdName,
  resident,
}: OtherResidentDialogProps) {
  const { addOtherResident, updateOtherResident, isSaving } = usePeople();
  const isEdit = !!resident;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [relation, setRelation] = useState<OtherResidentRelation>("Other");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (resident) {
      setFirstName(resident.firstName);
      setLastName(resident.lastName);
      setRelation(resident.relation);
      setPhone(resident.phone);
      setNotes(resident.notes);
    } else {
      setFirstName("");
      setLastName("");
      setRelation("Other");
      setPhone("");
      setNotes("");
    }
  }, [open, resident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      firstName,
      lastName,
      relation,
      phone: phone || undefined,
      notes: notes || undefined,
    };

    const result = isEdit
      ? await updateOtherResident(resident!.id, input)
      : await addOtherResident(householdId, input);

    if (result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Other Resident" : "Add Other Resident"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update resident details for ${householdName}`
              : `Someone living at ${householdName} who has not attended church yet`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resident-first-name">First Name</Label>
                <Input
                  id="resident-first-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  disabled={isSaving}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident-last-name">Last Name</Label>
                <Input
                  id="resident-last-name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={isSaving}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resident-relation">Relation to Household</Label>
              <Select
                value={relation}
                onValueChange={v => setRelation(v as OtherResidentRelation)}
                disabled={isSaving}
              >
                <SelectTrigger id="resident-relation" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONS.map(r => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resident-phone">Phone (optional)</Label>
              <Input
                id="resident-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={isSaving}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resident-notes">Notes (optional)</Label>
              <Textarea
                id="resident-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                disabled={isSaving}
                className="rounded-lg"
                placeholder="e.g. visiting relative, lives in basement unit"
              />
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
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Resident"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
