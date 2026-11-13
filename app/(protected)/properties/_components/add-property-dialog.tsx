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
import { DEFAULT_CURRENCY, getCurrencySymbol } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useProperties } from "@/lib/properties";
import type { CreatePropertyInput } from "@/lib/supabase/properties";
import { PropertyImageField } from "./property-image-field";

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    input: CreatePropertyInput,
    imageFile?: File | null,
  ) => Promise<unknown>;
  isAdmin: boolean;
}

export function AddPropertyDialog({
  open,
  onOpenChange,
  onSubmit,
  isAdmin,
}: AddPropertyDialogProps) {
  const { settings } = useOrganizationSettings();
  const { activePropertyTypes } = useProperties();
  const currency = settings.currency ?? DEFAULT_CURRENCY;
  const symbol = getCurrencySymbol(currency);

  const defaultTypeId = activePropertyTypes[0]?.id ?? "";

  const [formData, setFormData] = useState({
    name: "",
    propertyTypeId: defaultTypeId,
    purchaseDate: "",
    estimatedValue: "",
    description: "",
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open || formData.propertyTypeId) return;
    if (defaultTypeId) {
      setFormData(prev => ({ ...prev, propertyTypeId: defaultTypeId }));
    }
  }, [open, defaultTypeId, formData.propertyTypeId]);

  const typeOptions = useMemo(() => activePropertyTypes, [activePropertyTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !formData.propertyTypeId) return;

    const result = await onSubmit(
      {
        name: formData.name.trim(),
        propertyTypeId: formData.propertyTypeId,
        purchaseDate: formData.purchaseDate || null,
        estimatedValue: Number(formData.estimatedValue) || 0,
        description: formData.description.trim(),
        notes: formData.notes.trim(),
      },
      imageFile,
    );

    if (result) {
      onOpenChange(false);
      setFormData({
        name: "",
        propertyTypeId: defaultTypeId,
        purchaseDate: "",
        estimatedValue: "",
        description: "",
        notes: "",
      });
      setImageFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Add Church Property</DialogTitle>
          <DialogDescription>
            Register a new property or asset owned by the church
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <PropertyImageField
              onFileChange={setImageFile}
              disabled={!isAdmin}
              variant="large"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-name">Property Name</Label>
                <Input
                  id="property-name"
                  placeholder="e.g., Main Church Building"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select
                  value={formData.propertyTypeId}
                  onValueChange={value =>
                    setFormData({ ...formData, propertyTypeId: value })
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase-date">Purchase Date</Label>
                <Input
                  id="purchase-date"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={e =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Estimated Value ({symbol})</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={formData.estimatedValue}
                  onChange={e =>
                    setFormData({ ...formData, estimatedValue: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g. Electric guitar, Ibanez RG series"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-lg"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes (condition, storage location, etc.)"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="rounded-lg"
                rows={2}
              />
            </div>
          </div>
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
              type="submit"
              className="min-h-11 rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
              disabled={!isAdmin || !formData.propertyTypeId}
            >
              Add Property
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
