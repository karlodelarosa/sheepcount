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
import { Loader2, UserMinus } from "lucide-react";

interface RemoveHouseholdMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  householdName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function RemoveHouseholdMemberDialog({
  open,
  onOpenChange,
  personName,
  householdName,
  onConfirm,
  isLoading = false,
}: RemoveHouseholdMemberDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5" />
            Remove from Household
          </AlertDialogTitle>
          <AlertDialogDescription>
            Remove {personName} from {householdName}? They will stay in your
            people directory but will no longer be linked to this household.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={e => {
              e.preventDefault();
              void onConfirm();
            }}
            disabled={isLoading}
            className="rounded-xl bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
