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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_CURRENCY, getCurrencySymbol } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import type {
  CampaignCategory,
  FundraisingCampaign,
  UpdateFundraisingCampaignInput,
} from "@/lib/supabase/goal-projects";

export function EditGoalProjectDialog({
  open,
  onOpenChange,
  campaign,
  onSubmit,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: FundraisingCampaign;
  onSubmit: (input: UpdateFundraisingCampaignInput) => Promise<unknown>;
  isAdmin: boolean;
}) {
  const { settings } = useOrganizationSettings();
  const currency = settings.currency ?? DEFAULT_CURRENCY;
  const symbol = getCurrencySymbol(currency);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    targetDate: "",
    category: "Other" as CampaignCategory,
  });

  useEffect(() => {
    if (!open) return;
    setFormData({
      title: campaign.title,
      description: campaign.description,
      goalAmount: String(campaign.goalAmount),
      targetDate: campaign.targetDate ?? "",
      category: campaign.category,
    });
  }, [campaign, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const result = await onSubmit({
      id: campaign.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      goalAmount: Number(formData.goalAmount),
      targetDate: formData.targetDate || null,
      category: formData.category,
    });
    if (result) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>Update campaign details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-title">Title</Label>
              <Input
                id="campaign-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea
                id="campaign-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-lg"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-goal">Goal Amount ({symbol})</Label>
                <Input
                  id="campaign-goal"
                  type="number"
                  value={formData.goalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, goalAmount: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-target">Target Date</Label>
                <Input
                  id="campaign-target"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as CampaignCategory,
                  })
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Building">Building</SelectItem>
                  <SelectItem value="Missions">Missions</SelectItem>
                  <SelectItem value="Youth">Youth</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              type="submit"
              className="rounded-lg bg-slate-900 hover:bg-slate-800"
              disabled={!isAdmin}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

