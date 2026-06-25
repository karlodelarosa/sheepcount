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
import type { PropertyBorrow } from "@/lib/supabase/properties";

export function ReturnBorrowDialog({
  open,
  onOpenChange,
  borrow,
  propertyName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrow: PropertyBorrow;
  propertyName: string;
  onConfirm: (returnedAt: string) => Promise<boolean>;
}) {
  const [returnedAt, setReturnedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );

  const handleConfirm = async () => {
    const ok = await onConfirm(returnedAt);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Mark as returned</DialogTitle>
          <DialogDescription>
            Record the return date for <span className="font-medium">{propertyName}</span>{" "}
            borrowed by <span className="font-medium">{borrow.borrowerName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="returned-at">Return date</Label>
          <Input
            id="returned-at"
            type="date"
            value={returnedAt}
            onChange={e => setReturnedAt(e.target.value)}
            className="rounded-lg mt-2"
            required
          />
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
            type="button"
            onClick={() => void handleConfirm()}
            className="rounded-lg bg-slate-900 hover:bg-slate-800"
          >
            Confirm return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
