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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ServiceType } from "@/lib/supabase/service-attendance";
import { DEFAULT_SERVICE_START_TIME } from "../_lib/attendance-workflow";

export type EditSessionDetailsInput = {
  serviceId: string;
  date: string;
  serviceStartTime: string;
};

interface EditSessionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  date: string;
  serviceStartTime: string;
  serviceTypes: ServiceType[];
  isSaving?: boolean;
  onSave: (input: EditSessionDetailsInput) => Promise<boolean>;
}

export function EditSessionDetailsDialog({
  open,
  onOpenChange,
  serviceId,
  date,
  serviceStartTime,
  serviceTypes,
  isSaving = false,
  onSave,
}: EditSessionDetailsDialogProps) {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState(DEFAULT_SERVICE_START_TIME);

  useEffect(() => {
    if (!open) return;

    setSelectedServiceId(serviceId);
    setSessionDate(date);
    setStartTime(serviceStartTime);
  }, [open, serviceId, date, serviceStartTime]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedServiceId || !sessionDate) return;

    const ok = await onSave({
      serviceId: selectedServiceId,
      date: sessionDate,
      serviceStartTime: startTime,
    });

    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit session details</DialogTitle>
          <DialogDescription>
            Update the service type, date, or start time for this attendance
            record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-service-type">Service type</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
              disabled={isSaving || serviceTypes.length === 0}
            >
              <SelectTrigger id="session-service-type">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-date">Date</Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(event) => setSessionDate(event.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-start-time">Service start time</Label>
            <Input
              id="session-start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !selectedServiceId}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
