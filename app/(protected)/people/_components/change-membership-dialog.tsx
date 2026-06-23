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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import {
  getMembershipDisplayLabel,
  MEMBERSHIP_TYPE_OPTIONS,
} from "@/lib/membership-path";
import type { MembershipType } from "@/lib/people";

interface ChangeMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  currentMembershipType: MembershipType;
  visitDate?: string;
  onConfirm: (membershipType: MembershipType) => void | Promise<void>;
  isSaving?: boolean;
}

export function ChangeMembershipDialog({
  open,
  onOpenChange,
  personName,
  currentMembershipType,
  visitDate,
  onConfirm,
  isSaving = false,
}: ChangeMembershipDialogProps) {
  const [membershipType, setMembershipType] =
    useState<MembershipType>(currentMembershipType);

  useEffect(() => {
    if (open) {
      setMembershipType(currentMembershipType);
    }
  }, [open, currentMembershipType]);

  const currentLabel = getMembershipDisplayLabel(
    currentMembershipType,
    visitDate,
  );
  const hasChange = membershipType !== currentMembershipType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Change membership
          </DialogTitle>
          <DialogDescription>
            Update where <strong>{personName}</strong> is on the journey. Only
            membership is changed — other profile details stay the same.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
            <span className="text-muted-foreground">Current: </span>
            <span className="font-medium">{currentLabel}</span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="change-membership-type">New membership</Label>
            <Select
              value={membershipType}
              onValueChange={value =>
                setMembershipType(value as MembershipType)
              }
            >
              <SelectTrigger
                id="change-membership-type"
                className="rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBERSHIP_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving || !hasChange}
            onClick={() => void onConfirm(membershipType)}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save membership"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
