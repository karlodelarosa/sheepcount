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
import { Loader2 } from "lucide-react";
import { usePeople } from "@/lib/people";

interface AddHouseholdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddHouseholdDialog({
  open,
  onOpenChange,
}: AddHouseholdDialogProps) {
  const { addHousehold, isSaving } = usePeople();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const household = await addHousehold({
      name: formData.name,
      address: formData.address || undefined,
    });
    if (household) {
      onOpenChange(false);
      setFormData({ name: "", address: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Add New Household</DialogTitle>
          <DialogDescription>
            Create a new household record. You can add members after creating
            the household.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Household Name</Label>
              <Input
                id="name"
                placeholder="e.g., Smith Family"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-lg"
                required
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Street address, city, state, ZIP"
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="rounded-lg"
                rows={3}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 hover:bg-slate-800"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Household"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
