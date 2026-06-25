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
import { DEFAULT_CURRENCY, getCurrencySymbol } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useProperties } from "@/lib/properties";
import type {
  ChurchProperty,
  PropertyStatus,
  UpdatePropertyInput,
} from "@/lib/supabase/properties";
import { PropertyImageField } from "./property-image-field";

export function EditPropertyDialog({
  open,
  onOpenChange,
  property,
  onSubmit,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: ChurchProperty;
  onSubmit: (input: UpdatePropertyInput, imageFile?: File | null) => Promise<unknown>;
  isAdmin: boolean;
}) {
  const { settings } = useOrganizationSettings();
  const { activePropertyTypes } = useProperties();
  const currency = settings.currency ?? DEFAULT_CURRENCY;
  const symbol = getCurrencySymbol(currency);

  const [formData, setFormData] = useState({
    name: "",
    propertyTypeId: "",
    purchaseDate: "",
    estimatedValue: "",
    status: "owned" as PropertyStatus,
    description: "",
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormData({
      name: property.name,
      propertyTypeId: property.propertyTypeId,
      purchaseDate: property.purchaseDate ?? "",
      estimatedValue: String(property.estimatedValue),
      status: property.status,
      description: property.description,
      notes: property.notes,
    });
    setImageFile(null);
  }, [property, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const result = await onSubmit(
      {
        id: property.id,
        name: formData.name.trim(),
        propertyTypeId: formData.propertyTypeId,
        imageUrl: property.imageUrl,
        purchaseDate: formData.purchaseDate || null,
        estimatedValue: Number(formData.estimatedValue) || 0,
        status: formData.status,
        description: formData.description.trim(),
        notes: formData.notes.trim(),
      },
      imageFile,
    );

    if (result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update property details and status</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <PropertyImageField
              currentImageUrl={property.imageUrl}
              onFileChange={setImageFile}
              disabled={!isAdmin}
              variant="large"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-property-name">Property Name</Label>
                <Input
                  id="edit-property-name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Property Type</Label>
                <Select
                  value={formData.propertyTypeId}
                  onValueChange={value =>
                    setFormData({ ...formData, propertyTypeId: value })
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activePropertyTypes.map(type => (
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
                <Label htmlFor="edit-purchase-date">Purchase Date</Label>
                <Input
                  id="edit-purchase-date"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={e =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-value">Estimated Value ({symbol})</Label>
                <Input
                  id="edit-value"
                  type="number"
                  min="0"
                  step="0.01"
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
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData({ ...formData, status: value as PropertyStatus })
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owned">Owned</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
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
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Internal notes (condition, storage location, etc.)"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
              className="rounded-lg bg-slate-900 hover:bg-slate-800"
              disabled={!isAdmin}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
