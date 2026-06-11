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
import { Loader2, Trash2, UserPlus, Save, UserX, UserCheck } from "lucide-react";

export type ConfirmPersonVariant =
  | "add"
  | "edit"
  | "delete"
  | "inactive"
  | "activate";

const variantConfig: Record<
  ConfirmPersonVariant,
  {
    title: string;
    description: (name: string) => string;
    actionLabel: string;
    icon: typeof UserPlus;
    destructive?: boolean;
  }
> = {
  add: {
    title: "Add Person",
    description: name =>
      `Add ${name} to your people directory? Their profile will be saved to your organization.`,
    actionLabel: "Add Person",
    icon: UserPlus,
  },
  edit: {
    title: "Save Changes",
    description: name =>
      `Save changes to ${name}'s profile? Updated details will be stored for your organization.`,
    actionLabel: "Save Changes",
    icon: Save,
  },
  delete: {
    title: "Delete Person",
    description: name =>
      `Permanently delete ${name} from your directory? This action cannot be undone.`,
    actionLabel: "Delete Person",
    icon: Trash2,
    destructive: true,
  },
  inactive: {
    title: "Mark as Inactive",
    description: name =>
      `Mark ${name} as inactive? They will remain in your directory but will no longer be counted as active.`,
    actionLabel: "Mark Inactive",
    icon: UserX,
  },
  activate: {
    title: "Mark as Active",
    description: name =>
      `Mark ${name} as active again? They will be restored to your active people list.`,
    actionLabel: "Mark Active",
    icon: UserCheck,
  },
};

interface ConfirmPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ConfirmPersonVariant;
  personName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ConfirmPersonDialog({
  open,
  onOpenChange,
  variant,
  personName,
  onConfirm,
  isLoading = false,
}: ConfirmPersonDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {config.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {config.description(personName)}
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
            className={
              config.destructive
                ? "rounded-xl bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : "rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {config.actionLabel}
              </>
            ) : (
              config.actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
