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
import { Heart } from "lucide-react";
import type {
  CreateWeddingRecordInput,
  WeddingRecord,
} from "@/lib/supabase/weddings";

interface RecordWeddingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onRecord: (
    input: CreateWeddingRecordInput,
    photoFile?: File | null,
  ) => Promise<WeddingRecord | null>;
}

const EMPTY_FORM = {
  spouse1Name: "",
  spouse2Name: "",
  marriedAt: new Date().toISOString().slice(0, 10),
  location: "",
  officiantName: "",
  witnesses: "",
  licenseNumber: "",
  licenseAuthority: "",
  notes: "",
};

export function RecordWeddingDialog({
  open,
  onOpenChange,
  isSaving,
  onRecord,
}: RecordWeddingDialogProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setPhotoFile(null);
  };

  const handleSubmit = async () => {
    if (!formData.spouse1Name || !formData.spouse2Name || !formData.marriedAt) {
      return;
    }

    const record = await onRecord(
      {
        spouse1Name: formData.spouse1Name.trim(),
        spouse2Name: formData.spouse2Name.trim(),
        marriedAt: formData.marriedAt,
        location: formData.location.trim(),
        officiantName: formData.officiantName.trim(),
        witnesses: formData.witnesses.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        licenseAuthority: formData.licenseAuthority.trim(),
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
            <Heart className="w-5 h-5" />
            Record Wedding
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Add a wedding record. The couple doesn&apos;t need to be existing
            members — just type their names.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <PhotoUploadField
            label="Photo (optional)"
            alt="Wedding photo"
            onFileChange={setPhotoFile}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wedding-spouse1">Spouse 1 name</Label>
              <Input
                id="wedding-spouse1"
                value={formData.spouse1Name}
                onChange={e =>
                  setFormData({ ...formData, spouse1Name: e.target.value })
                }
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wedding-spouse2">Spouse 2 name</Label>
              <Input
                id="wedding-spouse2"
                value={formData.spouse2Name}
                onChange={e =>
                  setFormData({ ...formData, spouse2Name: e.target.value })
                }
                placeholder="e.g. John Smith"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wedding-date">Wedding date</Label>
            <Input
              id="wedding-date"
              type="date"
              value={formData.marriedAt}
              onChange={e =>
                setFormData({ ...formData, marriedAt: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wedding-location">Location (optional)</Label>
            <Input
              id="wedding-location"
              value={formData.location}
              onChange={e =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g. Main sanctuary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wedding-officiant">Officiant (optional)</Label>
            <Input
              id="wedding-officiant"
              value={formData.officiantName}
              onChange={e =>
                setFormData({ ...formData, officiantName: e.target.value })
              }
              placeholder="e.g. Pastor John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wedding-witnesses">Witnesses (optional)</Label>
            <Textarea
              id="wedding-witnesses"
              value={formData.witnesses}
              onChange={e =>
                setFormData({ ...formData, witnesses: e.target.value })
              }
              placeholder="One name per line"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wedding-license-number">
                License number (optional)
              </Label>
              <Input
                id="wedding-license-number"
                value={formData.licenseNumber}
                onChange={e =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wedding-license-authority">
                Issuing authority (optional)
              </Label>
              <Input
                id="wedding-license-authority"
                value={formData.licenseAuthority}
                onChange={e =>
                  setFormData({
                    ...formData,
                    licenseAuthority: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wedding-notes">Notes (optional)</Label>
            <Textarea
              id="wedding-notes"
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
            disabled={
              !formData.spouse1Name ||
              !formData.spouse2Name ||
              !formData.marriedAt ||
              isSaving
            }
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isSaving ? "Saving..." : "Record wedding"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
