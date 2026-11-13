"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserCheck } from "lucide-react";

interface PromoteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  nextStepLabel: string;
  onConfirm: () => void;
}

export function PromoteMemberDialog({
  open,
  onOpenChange,
  personName,
  nextStepLabel,
  onConfirm,
}: PromoteMemberDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Promote to {nextStepLabel}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Move <strong>{personName}</strong> to{" "}
            <strong>{nextStepLabel}</strong> on their journey? This updates
            their membership type in your directory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)] focus-visible:ring-[var(--accent-color)]"
          >
            Promote to {nextStepLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
