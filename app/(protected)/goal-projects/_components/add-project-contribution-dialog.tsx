import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockGoalProjects } from "@/components/mock-data";

interface AddProjectContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

export function AddProjectContributionDialog({ open, onOpenChange, projectId }: AddProjectContributionDialogProps) {
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    notes: "",
  });

  const project = mockGoalProjects.find(p => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding contribution to project:", { projectId, ...formData });
    onOpenChange(false);
    setFormData({ amount: "", date: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Add Contribution</DialogTitle>
          <DialogDescription>
            {project ? `Record a contribution to ${project.name}` : "Add funds to a project"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {project && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-slate-600">Current Progress</p>
                <p className="text-slate-900">
                  ${project.raisedAmount.toLocaleString()} of ${project.goalAmount.toLocaleString()}
                </p>
                <p className="text-slate-600 mt-1">
                  Remaining: ${(project.goalAmount - project.raisedAmount).toLocaleString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contribution-amount">Amount ($)</Label>
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
              Add Contribution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
