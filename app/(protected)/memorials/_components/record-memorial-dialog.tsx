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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonSelect } from "@/components/person-select";
import { PhotoUploadField } from "@/components/photo-upload-field";
import { Cross } from "lucide-react";
import type { Person } from "@/lib/people";
import type {
  CreateMemorialRecordInput,
  MemorialRecord,
} from "@/lib/supabase/memorials";

interface RecordMemorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  isSaving: boolean;
  onRecord: (
    input: CreateMemorialRecordInput,
    photoFile?: File | null,
  ) => Promise<MemorialRecord | null>;
}

const EMPTY_FORM = {
  personId: "",
  deceasedName: "",
  deathDate: new Date().toISOString().slice(0, 10),
  serviceDate: "",
  location: "",
  officiantName: "",
  survivedBy: "",
  notes: "",
};

export function RecordMemorialDialog({
  open,
  onOpenChange,
  people,
  isSaving,
  onRecord,
}: RecordMemorialDialogProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setPhotoFile(null);
  };

  const handlePersonChange = (value: string) => {
    if (value === "__none__") {
      setFormData(prev => ({ ...prev, personId: "" }));
      return;
    }
    const person = people.find(p => p.id === value);
    setFormData(prev => ({
      ...prev,
      personId: value,
      deceasedName: person?.name ?? prev.deceasedName,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.deceasedName || !formData.deathDate) return;

    const record = await onRecord(
      {
        personId: formData.personId || null,
        deceasedName: formData.deceasedName.trim(),
        deathDate: formData.deathDate,
        serviceDate: formData.serviceDate || null,
        location: formData.location.trim(),
        officiantName: formData.officiantName.trim(),
        survivedBy: formData.survivedBy.trim(),
        notes: formData.notes.trim(),
      },
      photoFile,
    );

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
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto dark:bg-zinc-800 dark:border-zinc-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Cross className="w-5 h-5" />
            Record Memorial
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Add a memorial record. Link an existing person if they were a
            member, or just type their name.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <PhotoUploadField
            label="Photo (optional)"
            alt="Memorial photo"
            onFileChange={setPhotoFile}
          />

          <div className="space-y-2">
            <Label htmlFor="memorial-person">
              Link to existing person (optional)
            </Label>
            <PersonSelect
              id="memorial-person"
              people={people}
              value={formData.personId || "__none__"}
              onValueChange={handlePersonChange}
              placeholder="Select person"
              formatLabel={person => person.name}
              pinnedOptions={[{ value: "__none__", label: "None" }]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memorial-name">Deceased person&apos;s name</Label>
            <Input
              id="memorial-name"
              value={formData.deceasedName}
              onChange={e =>
                setFormData({ ...formData, deceasedName: e.target.value })
              }
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memorial-death-date">Date of passing</Label>
              <Input
                id="memorial-death-date"
                type="date"
                value={formData.deathDate}
                onChange={e =>
                  setFormData({ ...formData, deathDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memorial-service-date">
                Service date (optional)
              </Label>
              <Input
                id="memorial-service-date"
                type="date"
                value={formData.serviceDate}
                onChange={e =>
                  setFormData({ ...formData, serviceDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memorial-location">
              Service location (optional)
            </Label>
            <Input
              id="memorial-location"
              value={formData.location}
              onChange={e =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Main sanctuary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memorial-officiant">Officiant (optional)</Label>
            <Input
              id="memorial-officiant"
              value={formData.officiantName}
              onChange={e =>
                setFormData({ ...formData, officiantName: e.target.value })
              }
              placeholder="e.g. Pastor John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memorial-survived-by">Survived by (optional)</Label>
            <Textarea
              id="memorial-survived-by"
              value={formData.survivedBy}
              onChange={e =>
                setFormData({ ...formData, survivedBy: e.target.value })
              }
              placeholder="One name per line"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memorial-notes">Notes (optional)</Label>
            <Textarea
              id="memorial-notes"
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
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
            disabled={!formData.deceasedName || !formData.deathDate || isSaving}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isSaving ? "Saving..." : "Record memorial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
