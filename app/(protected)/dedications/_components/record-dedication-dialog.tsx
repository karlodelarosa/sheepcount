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
import { PhotoUploadField } from "@/components/photo-upload-field";
import { Baby } from "lucide-react";
import type {
  CreateDedicationRecordInput,
  DedicationRecord,
} from "@/lib/supabase/dedications";

interface RecordDedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onRecord: (
    input: CreateDedicationRecordInput,
    photoFile?: File | null,
  ) => Promise<DedicationRecord | null>;
}

const EMPTY_FORM = {
  childName: "",
  parentNames: "",
  dedicatedAt: new Date().toISOString().slice(0, 10),
  location: "",
  officiantName: "",
  sponsors: "",
  notes: "",
};

export function RecordDedicationDialog({
  open,
  onOpenChange,
  isSaving,
  onRecord,
}: RecordDedicationDialogProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setPhotoFile(null);
  };

  const handleSubmit = async () => {
    if (!formData.childName || !formData.dedicatedAt) return;

    const record = await onRecord(
      {
        childName: formData.childName.trim(),
        parentNames: formData.parentNames.trim(),
        dedicatedAt: formData.dedicatedAt,
        location: formData.location.trim(),
        officiantName: formData.officiantName.trim(),
        sponsors: formData.sponsors.trim(),
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
            <Baby className="w-5 h-5" />
            Record Child Dedication
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Add a dedication record. The child and parents don&apos;t need to be
            existing members — just type their names.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <PhotoUploadField
            label="Photo (optional)"
            alt="Dedication photo"
            onFileChange={setPhotoFile}
          />

          <div className="space-y-2">
            <Label htmlFor="dedication-child">Child&apos;s name</Label>
            <Input
              id="dedication-child"
              value={formData.childName}
              onChange={e =>
                setFormData({ ...formData, childName: e.target.value })
              }
              placeholder="e.g. Baby Grace Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dedication-parents">
              Parent(s) name(s) (optional)
            </Label>
            <Input
              id="dedication-parents"
              value={formData.parentNames}
              onChange={e =>
                setFormData({ ...formData, parentNames: e.target.value })
              }
              placeholder="e.g. John & Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dedication-date">Dedication date</Label>
            <Input
              id="dedication-date"
              type="date"
              value={formData.dedicatedAt}
              onChange={e =>
                setFormData({ ...formData, dedicatedAt: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dedication-location">Location (optional)</Label>
            <Input
              id="dedication-location"
              value={formData.location}
              onChange={e =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Main sanctuary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dedication-officiant">Officiant (optional)</Label>
            <Input
              id="dedication-officiant"
              value={formData.officiantName}
              onChange={e =>
                setFormData({ ...formData, officiantName: e.target.value })
              }
              placeholder="e.g. Pastor John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dedication-sponsors">
              Sponsors / godparents (optional)
            </Label>
            <Textarea
              id="dedication-sponsors"
              value={formData.sponsors}
              onChange={e =>
                setFormData({ ...formData, sponsors: e.target.value })
              }
              placeholder="One name per line"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dedication-notes">Notes (optional)</Label>
            <Textarea
              id="dedication-notes"
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
            disabled={!formData.childName || !formData.dedicatedAt || isSaving}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isSaving ? "Saving..." : "Record dedication"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
