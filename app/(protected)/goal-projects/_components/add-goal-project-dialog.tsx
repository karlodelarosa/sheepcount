"use client";

import { useState } from "react";
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
  CreateFundraisingCampaignInput,
} from "@/lib/supabase/goal-projects";

interface AddGoalProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateFundraisingCampaignInput) => Promise<unknown>;
  isAdmin: boolean;
}

export function AddGoalProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  isAdmin,
}: AddGoalProjectDialogProps) {
  const { settings } = useOrganizationSettings();
  const currency = settings.currency ?? DEFAULT_CURRENCY;
  const symbol = getCurrencySymbol(currency);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goalAmount: "",
    targetDate: "",
    category: "" as CampaignCategory | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const result = await onSubmit({
      title: formData.name.trim(),
      description: formData.description.trim(),
      goalAmount: Number(formData.goalAmount),
      targetDate: formData.targetDate || null,
      category: (formData.category || "Other") as CampaignCategory,
    });

    if (result) {
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        goalAmount: "",
        targetDate: "",
        category: "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Create Fundraising Campaign</DialogTitle>
          <DialogDescription>
            Set up a new fundraising goal for your church
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g., New Sanctuary Renovation"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project and its purpose"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-lg"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-amount">Goal Amount ({symbol})</Label>
                <Input
                  id="goal-amount"
                  type="number"
                  placeholder="1000000"
                  value={formData.goalAmount}
                  onChange={e =>
                    setFormData({ ...formData, goalAmount: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={formData.targetDate}
                  onChange={e =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    category: value as CampaignCategory,
                  })
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select category" />
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
              className="min-h-11 rounded-xl bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]"
              disabled={!isAdmin}
            >
              Create Campaign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
