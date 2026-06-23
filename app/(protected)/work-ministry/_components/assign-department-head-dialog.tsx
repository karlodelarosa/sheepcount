"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { PersonSelect } from "@/components/person-select";
import { usePeople } from "@/lib/people";
import { useGroupsMinistry } from "@/lib/groups-ministry";
import { useLeadership } from "@/lib/leadership";

interface AssignDepartmentHeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministryId: string;
  ministryName: string;
  currentHeadPersonId: string | null;
}

export function AssignDepartmentHeadDialog({
  open,
  onOpenChange,
  ministryId,
  ministryName,
  currentHeadPersonId,
}: AssignDepartmentHeadDialogProps) {
  const { people } = usePeople();
  const { assignWorkMinistryHead, isSaving } = useGroupsMinistry();
  const { refreshLeadership } = useLeadership();
  const [headPersonId, setHeadPersonId] = useState(currentHeadPersonId ?? "");

  useEffect(() => {
    if (!open) return;
    setHeadPersonId(currentHeadPersonId ?? "");
  }, [open, currentHeadPersonId]);

  const headChanged = headPersonId !== (currentHeadPersonId ?? "");

  const handleSave = async () => {
    if (!headPersonId) return;
    const result = await assignWorkMinistryHead(ministryId, headPersonId);
    if (result) {
      await refreshLeadership();
      onOpenChange(false);
    }
  };

  const handleClear = async () => {
    const result = await assignWorkMinistryHead(ministryId, null);
    if (result) {
      await refreshLeadership();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle>Department Head</DialogTitle>
          <DialogDescription>
            Assign who leads {ministryName} on the Leadership org chart. Team
            Leads are assigned per team on the members list.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Department head</Label>
            <PersonSelect
              people={people}
              value={headPersonId}
              onValueChange={setHeadPersonId}
              placeholder="Choose a person"
              triggerClassName="rounded-lg bg-white border-slate-200 text-slate-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {currentHeadPersonId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleClear()}
              disabled={isSaving}
              className="rounded-lg border-slate-200 dark:border-zinc-700 mr-auto"
            >
              Clear
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={!headPersonId || !headChanged || isSaving}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
