"use client";

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

interface AddProspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProspectDialog({
  open,
  onOpenChange,
}: AddProspectDialogProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProspect = {
      name: formData.get("name") as string,
      age: formData.get("age") ? Number(formData.get("age")) : undefined,
      phone: formData.get("phone") as string | undefined,
      social: formData.get("social") as string | undefined,
    };
    console.log("New Prospect:", newProspect);
    // TODO: send newProspect to backend or state management
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle>Add New Prospect</DialogTitle>
          <DialogDescription>
            Add a new first-time attender or newly met person
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
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="30"
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="social">Facebook / Instagram</Label>
              <Input
                id="social"
                name="social"
                placeholder="@username or profile link"
                className="rounded-xl"
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
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
            >
              Add Prospect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
