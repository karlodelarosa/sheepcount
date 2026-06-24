"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import {
  cancelOrganizationSubscription,
  verifyAccountPassword,
} from "@/lib/supabase/profile";
import { toast } from "sonner";

type CancelSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  userEmail: string;
  onCancelled: () => Promise<unknown>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  organizationId,
  userEmail,
  onCancelled,
}: CancelSubscriptionDialogProps) {
  const supabase = useMemo(() => createClient(), []);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setReason("");
    setPassword("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    if (!password) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyAccountPassword(supabase, userEmail, password);
      await cancelOrganizationSubscription(
        supabase,
        organizationId,
        trimmedReason,
      );
      await onCancelled();
      handleOpenChange(false);
      toast.success("Subscription will cancel at period end");
    } catch (error) {
      toast.error("Failed to cancel subscription", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel subscription</DialogTitle>
          <DialogDescription>
            Your subscription will remain active until the end of the current
            billing period. This action requires your account password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for cancellation</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={event => setReason(event.target.value)}
              placeholder="Tell us why you are cancelling..."
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-password">Account password</Label>
            <Input
              id="cancel-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter your password to confirm"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              Confirming as {userEmail}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Keep subscription
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : "Confirm cancellation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
