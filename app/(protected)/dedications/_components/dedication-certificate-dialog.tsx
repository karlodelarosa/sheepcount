"use client";

import { useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CertificateOrientation } from "@/components/certificates/certificate";
import {
  DedicationCertificateWithTheme,
  downloadDedicationCertificateImage,
  openDedicationCertificatePrint,
  type DedicationCertificateData,
} from "./dedication-certificate";

type DedicationCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateData: DedicationCertificateData | null;
};

export function DedicationCertificateDialog({
  open,
  onOpenChange,
  certificateData,
}: DedicationCertificateDialogProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [orientation, setOrientation] =
    useState<CertificateOrientation>("landscape");

  const handlePrint = () => {
    if (!certificateData) return;
    openDedicationCertificatePrint({ ...certificateData, orientation });
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !certificateData) return;

    setIsDownloading(true);
    try {
      await downloadDedicationCertificateImage(certificateRef.current, {
        ...certificateData,
        orientation,
      });
    } catch {
      toast.error("Could not download certificate image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dedication certificate</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <Label className="text-sm text-slate-500 dark:text-zinc-400">
            Orientation
          </Label>
          <ToggleGroup
            type="single"
            value={orientation}
            onValueChange={value => {
              if (value) setOrientation(value as CertificateOrientation);
            }}
            variant="outline"
            className="rounded-xl"
          >
            <ToggleGroupItem value="landscape">Landscape</ToggleGroupItem>
            <ToggleGroupItem value="portrait">Portrait</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {certificateData && (
          <div ref={certificateRef}>
            <DedicationCertificateWithTheme
              childName={certificateData.childName}
              dedicatedAt={certificateData.dedicatedAt}
              location={certificateData.location}
              officiantName={certificateData.officiantName}
              parentNames={certificateData.parentNames}
              sponsors={certificateData.sponsors}
              orientation={orientation}
            />
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={!certificateData || isDownloading}
            onClick={() => void handleDownload()}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download image"}
          </Button>
          <Button
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
            disabled={!certificateData}
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print certificate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
