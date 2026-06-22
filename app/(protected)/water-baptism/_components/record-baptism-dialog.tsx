"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Droplets } from "lucide-react";
import type { Person } from "@/lib/people";
import type {
  BaptismRecord,
  CreateBaptismRecordInput,
} from "@/lib/supabase/baptism";

interface RecordBaptismDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  isSaving: boolean;
  defaultPersonId?: string;
  onRecord: (input: CreateBaptismRecordInput) => Promise<BaptismRecord | null>;
}

export function RecordBaptismDialog({
  open,
  onOpenChange,
  people,
  isSaving,
  defaultPersonId,
  onRecord,
}: RecordBaptismDialogProps) {
  const [personId, setPersonId] = useState(defaultPersonId ?? "");
  const [baptizedAt, setBaptizedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [location, setLocation] = useState("");
  const [officiantPersonId, setOfficiantPersonId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && defaultPersonId) {
      setPersonId(defaultPersonId);
    }
  }, [open, defaultPersonId]);

  const officiantCandidates = useMemo(
    () => people.filter(p => p.id !== personId),
    [people, personId],
  );

  const resetForm = () => {
    setPersonId(defaultPersonId ?? "");
    setBaptizedAt(new Date().toISOString().slice(0, 10));
    setLocation("");
    setOfficiantPersonId("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!personId || !baptizedAt) return;

    const record = await onRecord({
      personId,
      baptizedAt,
      location: location.trim(),
      officiantPersonId: officiantPersonId || null,
      notes: notes.trim(),
    });

    if (record) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) resetForm();
        onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-[480px] dark:bg-zinc-800 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Droplets className="w-5 h-5" />
            Record Water Baptism
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Add a baptism record. People baptized more than once will show full
            history on their profile.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="baptism-person">Person</Label>
            <Select
              value={personId}
              onValueChange={setPersonId}
              disabled={!!defaultPersonId}
            >
              <SelectTrigger id="baptism-person">
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {people.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baptism-date">Baptism date</Label>
            <Input
              id="baptism-date"
              type="date"
              value={baptizedAt}
              onChange={e => setBaptizedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baptism-location">Location (optional)</Label>
            <Input
              id="baptism-location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Main sanctuary baptistery"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baptism-officiant">Officiant (optional)</Label>
            <Select
              value={officiantPersonId || "__none__"}
              onValueChange={value =>
                setOfficiantPersonId(value === "__none__" ? "" : value)
              }
            >
              <SelectTrigger id="baptism-officiant">
                <SelectValue placeholder="Select officiant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {officiantCandidates.map(person => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baptism-notes">Notes (optional)</Label>
            <Textarea
              id="baptism-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional details"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!personId || !baptizedAt || isSaving}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isSaving ? "Saving..." : "Record baptism"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
