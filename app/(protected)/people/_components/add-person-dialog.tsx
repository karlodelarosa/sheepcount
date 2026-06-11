"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BirthdateField } from "@/components/birthdate-field";
import type { AddPersonInput } from "@/lib/people";

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: AddPersonInput) => void;
}

export function AddPersonDialog({
  open,
  onOpenChange,
  onAdd,
}: AddPersonDialogProps) {
  const [isProspect, setIsProspect] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onAdd({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      birthdate: formData.get("birthdate") as string,
      isProspect,
    });
    e.currentTarget.reset();
    setIsProspect(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle>Add People</DialogTitle>
          <DialogDescription>
            Add a new person to your directory. Name, phone, and birthdate are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                required
                className="rounded-xl"
              />
            </div>

            <BirthdateField key={String(open)} name="birthdate" required />

            <div className="flex items-center justify-between rounded-xl border border-slate-200/60 p-4 dark:border-zinc-700/60">
              <div className="space-y-0.5">
                <Label htmlFor="prospect">Prospect</Label>
                <p className="text-sm text-muted-foreground">
                  Mark as a first-time attender or newly met person
                </p>
              </div>
              <Switch
                id="prospect"
                checked={isProspect}
                onCheckedChange={setIsProspect}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              Add People
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
