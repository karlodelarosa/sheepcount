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
import { PersonSelect } from "@/components/person-select";
import { usePeople } from "@/lib/people";
import type {
  ChurchProperty,
  CreateBorrowInput,
} from "@/lib/supabase/properties";

export function AddBorrowDialog({
  open,
  onOpenChange,
  properties,
  defaultPropertyId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: ChurchProperty[];
  defaultPropertyId?: string;
  onSubmit: (input: CreateBorrowInput) => Promise<unknown>;
}) {
  const { people } = usePeople();
  const availableProperties = useMemo(
    () => properties.filter(p => p.status === "owned"),
    [properties],
  );

  const [formData, setFormData] = useState({
    propertyId: "",
    borrowerPersonId: "",
    borrowerName: "",
    borrowedAt: new Date().toISOString().slice(0, 10),
    dueAt: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    const initialPropertyId =
      defaultPropertyId &&
      availableProperties.some(p => p.id === defaultPropertyId)
        ? defaultPropertyId
        : availableProperties[0]?.id ?? "";
    setFormData({
      propertyId: initialPropertyId,
      borrowerPersonId: "",
      borrowerName: "",
      borrowedAt: new Date().toISOString().slice(0, 10),
      dueAt: "",
      notes: "",
    });
  }, [open, defaultPropertyId, availableProperties]);

  const selectedPerson = people.find(p => p.id === formData.borrowerPersonId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId) return;

    const borrowerName =
      selectedPerson?.name.trim() || formData.borrowerName.trim();
    if (!borrowerName) return;

    const result = await onSubmit({
      propertyId: formData.propertyId,
      borrowerPersonId: formData.borrowerPersonId || null,
      borrowerName,
      borrowedAt: formData.borrowedAt,
      dueAt: formData.dueAt || null,
      notes: formData.notes.trim(),
    });

    if (result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Record Borrow</DialogTitle>
          <DialogDescription>
            Log an item borrowed from church property inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <Select
                value={formData.propertyId}
                onValueChange={value =>
                  setFormData({ ...formData, propertyId: value })
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {availableProperties.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No available properties
                    </SelectItem>
                  ) : (
                    availableProperties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Borrower</Label>
              <PersonSelect
                people={people}
                value={formData.borrowerPersonId}
                onValueChange={value =>
                  setFormData({ ...formData, borrowerPersonId: value })
                }
                placeholder="Select person"
              />
            </div>

            {!formData.borrowerPersonId && (
              <div className="space-y-2">
                <Label htmlFor="borrower-name">Borrower name</Label>
                <Input
                  id="borrower-name"
                  placeholder="Name if not in directory"
                  value={formData.borrowerName}
                  onChange={e =>
                    setFormData({ ...formData, borrowerName: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="borrowed-at">Borrow date</Label>
                <Input
                  id="borrowed-at"
                  type="date"
                  value={formData.borrowedAt}
                  onChange={e =>
                    setFormData({ ...formData, borrowedAt: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-at">Expected return</Label>
                <Input
                  id="due-at"
                  type="date"
                  value={formData.dueAt}
                  onChange={e =>
                    setFormData({ ...formData, dueAt: e.target.value })
                  }
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrow-notes">Notes</Label>
              <Textarea
                id="borrow-notes"
                placeholder="Condition, purpose, or other details"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="rounded-lg"
                rows={3}
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
              disabled={!formData.propertyId || availableProperties.length === 0}
            >
              Record borrow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
