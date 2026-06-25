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

export function DeletePropertyDialog({
  open,
  onOpenChange,
  name,
  onConfirm,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
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
          <DialogTitle>Delete property</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-medium">{name}</span> and all of its borrow
            records. This cannot be undone.
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
            Delete property
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
