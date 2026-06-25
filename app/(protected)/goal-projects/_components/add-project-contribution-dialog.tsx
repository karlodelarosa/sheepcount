"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonSelect } from "@/components/person-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getCurrencySymbol,
} from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useGoalProjects } from "@/lib/goal-projects";
import { usePeople } from "@/lib/people";
import type { FundraisingContribution, PaymentMethod } from "@/lib/supabase/goal-projects";

interface AddProjectContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string | null;
  contribution?: FundraisingContribution | null;
}

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function AddProjectContributionDialog({
  open,
  onOpenChange,
  campaignId,
  contribution,
}: AddProjectContributionDialogProps) {
  const { settings } = useOrganizationSettings();
  const currency = settings.currency ?? DEFAULT_CURRENCY;
  const symbol = getCurrencySymbol(currency);
  const { people } = usePeople();
  const { getCampaign, getRaisedAmount, addContribution, updateContribution } =
    useGoalProjects();

  const campaign = campaignId ? getCampaign(campaignId) : null;
  const raisedAmount = campaignId ? getRaisedAmount(campaignId) : 0;

  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    notes: "",
    personId: "" as string | "",
    paymentMethod: "Cash" as PaymentMethod,
  });

  const title = contribution ? "Edit Contribution" : "Add Contribution";

  useEffect(() => {
    if (!open) return;
    if (contribution) {
      setFormData({
        amount: String(contribution.amount),
        date: contribution.contributedOn,
        notes: contribution.notes ?? "",
        personId: contribution.personId ?? "",
        paymentMethod: contribution.paymentMethod,
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      date: prev.date || todayIsoDate(),
      paymentMethod: prev.paymentMethod || "Cash",
    }));
  }, [open, contribution]);

  const progressSummary = useMemo(() => {
    if (!campaign) return null;
    const remaining = Math.max(campaign.goalAmount - raisedAmount, 0);
    return {
      raised: raisedAmount,
      goal: campaign.goalAmount,
      remaining,
    };
  }, [campaign, raisedAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId) return;

    const payload = {
      campaignId,
      personId: formData.personId || null,
      amount: Number(formData.amount),
      contributedOn: formData.date,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim(),
    };

    const saved = contribution
      ? await updateContribution({ id: contribution.id, ...payload })
      : await addContribution(payload);

    if (saved) {
      onOpenChange(false);
      setFormData({
        amount: "",
        date: todayIsoDate(),
        notes: "",
        personId: "",
        paymentMethod: "Cash",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {campaign
              ? `Record a contribution to ${campaign.title.trim() || "this campaign"}`
              : "Add funds to a campaign"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {campaign && progressSummary && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-slate-600">Current Progress</p>
                <p className="text-slate-900">
                  {formatCurrency(progressSummary.raised, currency)} of{" "}
                  {formatCurrency(progressSummary.goal, currency)}
                </p>
                <p className="text-slate-600 mt-1">
                  Remaining:{" "}
                  {formatCurrency(
                    progressSummary.remaining,
                    currency,
                  )}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contribution-amount">Amount ({symbol})</Label>
                <Input
                  id="contribution-amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contribution-date">Date</Label>
                <Input
                  id="contribution-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Donor (Optional)</Label>
                <PersonSelect
                  people={people}
                  value={formData.personId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, personId: value })
                  }
                  placeholder="Select person..."
                />
              </div>

              <div className="space-y-2">
                <Label>Payment method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      paymentMethod: value as PaymentMethod,
                    })
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online Bank">Online Bank</SelectItem>
                    <SelectItem value="E-wallet">E-wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contribution-notes">Notes (Optional)</Label>
              <Textarea
                id="contribution-notes"
                placeholder="Donor name or additional information"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-lg"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg bg-slate-900 hover:bg-slate-800">
              {contribution ? "Save Contribution" : "Add Contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
