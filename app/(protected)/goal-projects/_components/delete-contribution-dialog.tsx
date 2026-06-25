"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteContributionDialog({
  open,
  onOpenChange,
  onConfirm,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
  isAdmin: boolean;
}) {
  const handleConfirm = async () => {
    if (!isAdmin) return;
    const ok = await onConfirm();
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Delete contribution</DialogTitle>
          <DialogDescription>
            This will permanently delete this contribution. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
            variant="destructive"
            onClick={() => void handleConfirm()}
            className="rounded-lg"
            disabled={!isAdmin}
          >
            Delete contribution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

