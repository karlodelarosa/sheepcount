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
import type { ChurchProperty } from "@/lib/supabase/properties";
import { PropertyImageField } from "./property-image-field";
import { propertyToUpdateInput } from "./property-image-section";

export function UploadPropertyImageDialog({
  open,
  onOpenChange,
  property,
  onSubmit,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: ChurchProperty;
  onSubmit: (
    input: ReturnType<typeof propertyToUpdateInput>,
    imageFile?: File | null,
  ) => Promise<unknown>;
  isAdmin: boolean;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setImageFile(null);
  }, [open, property.id]);

  const handleSave = async () => {
    if (!isAdmin || !imageFile) return;
    const result = await onSubmit(propertyToUpdateInput(property), imageFile);
    if (result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Upload image</DialogTitle>
          <DialogDescription>
            Add a photo for <span className="font-medium">{property.name}</span>
          </DialogDescription>
        </DialogHeader>
        <PropertyImageField
          currentImageUrl={property.imageUrl}
          onFileChange={setImageFile}
          disabled={!isAdmin}
          variant="large"
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            className="rounded-lg bg-slate-900 hover:bg-slate-800"
            disabled={!isAdmin || !imageFile}
          >
            Save image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
