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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { usePeople } from "@/lib/people";
import type { MembershipType } from "@/lib/people";

interface AddHouseholdMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  householdName: string;
}

export function AddHouseholdMemberDialog({
  open,
  onOpenChange,
  householdId,
  householdName,
}: AddHouseholdMemberDialogProps) {
  const { addPersonToHousehold, isSaving } = usePeople();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    phone: "",
    birthdate: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      role: "",
      email: "",
      phone: "",
      birthdate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const person = await addPersonToHousehold(householdId, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      birthdate: formData.birthdate || undefined,
      role: formData.role || "Single",
      membershipType: "Member" as MembershipType,
    });
    if (person) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Add Household Member</DialogTitle>
          <DialogDescription>
            Add a new church member to {householdName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={e =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="rounded-lg"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={e =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="rounded-lg"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={value =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Head">Head</SelectItem>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={e =>
                    setFormData({ ...formData, birthdate: e.target.value })
                  }
                  className="rounded-lg"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="rounded-lg"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="rounded-lg"
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
              disabled={isSaving || !formData.role}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
