"use client";

import { useEffect, useRef, useState } from "react";
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
import { BirthdateField } from "@/components/birthdate-field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronDown, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MEMBERSHIP_PATH,
  MEMBERSHIP_PATH_DESCRIPTIONS,
  MEMBERSHIP_PATH_LABELS,
  type MembershipPathType,
} from "@/lib/membership-path";
import type { AddPersonInput } from "@/lib/people";

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    input: AddPersonInput,
    options: { addAnother: boolean },
  ) => Promise<boolean>;
  isSaving?: boolean;
}

export function AddPersonDialog({
  open,
  onOpenChange,
  onAdd,
  isSaving = false,
}: AddPersonDialogProps) {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [membershipType, setMembershipType] =
    useState<MembershipPathType>("Member");
  const [showDetails, setShowDetails] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [addedCount, setAddedCount] = useState(0);

  useEffect(() => {
    if (!open) {
      setAddedCount(0);
      setShowDetails(false);
      return;
    }

    const timer = window.setTimeout(() => firstNameRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open, formKey]);

  const resetForm = () => {
    formRef.current?.reset();
    setFormKey(k => k + 1);
    firstNameRef.current?.focus();
  };

  const buildInput = (formData: FormData): AddPersonInput => {
    const phone = (formData.get("phone") as string)?.trim();
    const birthdate = (formData.get("birthdate") as string)?.trim();

    return {
      firstName: formData.get("firstName") as string,
      middleName: (formData.get("middleName") as string) || undefined,
      lastName: formData.get("lastName") as string,
      phone: phone || undefined,
      birthdate: birthdate || undefined,
      membershipType,
    };
  };

  const submitForm = async (addAnother: boolean) => {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;

    const input = buildInput(new FormData(form));
    const success = await onAdd(input, { addAnother });

    if (!success) return;

    if (addAnother) {
      setAddedCount(count => count + 1);
      resetForm();
      return;
    }

    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border-slate-200/60 dark:border-zinc-700/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add People
            {addedCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                · {addedCount} added this session
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Enter a name and where they are on the journey. Use{" "}
            <strong>Add &amp; next</strong> to keep entering people quickly.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Where are they on the journey?</Label>
            <ToggleGroup
              type="single"
              value={membershipType}
              onValueChange={value => {
                if (value) setMembershipType(value as MembershipPathType);
              }}
              variant="outline"
              className="grid w-full grid-cols-2 gap-1 rounded-xl sm:grid-cols-4"
            >
              {MEMBERSHIP_PATH.map(step => (
                <ToggleGroupItem
                  key={step}
                  value={step}
                  aria-label={step}
                  className="rounded-lg px-2 text-xs sm:text-sm data-[state=on]:bg-slate-900 data-[state=on]:text-white dark:data-[state=on]:bg-purple-600"
                >
                  {MEMBERSHIP_PATH_LABELS[step]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">
              {MEMBERSHIP_PATH_DESCRIPTIONS[membershipType]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                ref={firstNameRef}
                id="firstName"
                name="firstName"
                placeholder="John"
                required
                disabled={isSaving}
                className="rounded-xl"
                autoComplete="given-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                required
                disabled={isSaving}
                className="rounded-xl"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">
              Phone{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              disabled={isSaving}
              className="rounded-xl"
              autoComplete="tel"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(v => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-slate-50 dark:border-zinc-700/60 dark:hover:bg-zinc-800/60"
          >
            <span>More details (middle name, birthdate)</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showDetails && "rotate-180",
              )}
            />
          </button>

          {showDetails && (
            <div className="grid gap-4 rounded-xl border border-slate-200/60 p-3 dark:border-zinc-700/60">
              <div className="grid gap-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  placeholder="Michael"
                  disabled={isSaving}
                  className="rounded-xl"
                />
              </div>
              <BirthdateField key={formKey} name="birthdate" />
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-xl"
            >
              {addedCount > 0 ? "Done" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isSaving}
              className="rounded-xl"
              onClick={() => void submitForm(true)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add & next"
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add & close"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
