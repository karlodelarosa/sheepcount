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
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

interface ManageMinistriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PendingDelete = {
  id: string;
  name: string;
  memberCount: number;
};

export function ManageMinistriesDialog({
  open,
  onOpenChange,
}: ManageMinistriesDialogProps) {
  const {
    workMinistries,
    workMinistryMembers,
    removeWorkMinistryById,
    isSaving,
  } = useGroupsMinistry();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  const handleConfirmRemove = async () => {
    if (!pendingDelete) return;
    const success = await removeWorkMinistryById(pendingDelete.id);
    if (success) setPendingDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-white border-slate-200/60 dark:bg-zinc-800 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Manage Ministries
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400">
            Remove ministries you no longer need. Sub-teams and member
            assignments for a removed ministry are deleted as well.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {workMinistries.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-6">
              No ministries yet.
            </p>
          ) : (
            workMinistries.map(ministry => {
              const memberCount = workMinistryMembers.filter(
                m => m.ministryId === ministry.id,
              ).length;

              return (
                <div
                  key={ministry.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/60 p-3 dark:border-zinc-700/60"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {ministry.name}
                    </p>
                    {ministry.description && (
                      <p className="text-sm text-slate-600 dark:text-zinc-400 truncate">
                        {ministry.description}
                      </p>
                    )}
                    <Badge
                      variant="secondary"
                      className="mt-1 rounded-md text-xs bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300"
                    >
                      {memberCount} member{memberCount === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setPendingDelete({
                        id: ministry.id,
                        name: ministry.name,
                        memberCount,
                      })
                    }
                    disabled={isSaving}
                    className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={open => {
          if (!open) setPendingDelete(null);
        }}
        title="Remove Ministry"
        description={
          pendingDelete
            ? pendingDelete.memberCount > 0
              ? `Remove "${pendingDelete.name}"? ${pendingDelete.memberCount} member assignment(s) will also be removed.`
              : `Remove "${pendingDelete.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Remove Ministry"
        onConfirm={handleConfirmRemove}
        isLoading={isSaving}
      />
    </>
  );
}
