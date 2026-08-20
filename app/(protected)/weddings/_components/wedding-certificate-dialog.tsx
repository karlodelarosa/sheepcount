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
  WeddingCertificateWithTheme,
  downloadWeddingCertificateImage,
  openWeddingCertificatePrint,
  type WeddingCertificateData,
} from "./wedding-certificate";

type WeddingCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateData: WeddingCertificateData | null;
};

export function WeddingCertificateDialog({
  open,
  onOpenChange,
  certificateData,
}: WeddingCertificateDialogProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [orientation, setOrientation] =
    useState<CertificateOrientation>("landscape");

  const handlePrint = () => {
    if (!certificateData) return;
    openWeddingCertificatePrint({ ...certificateData, orientation });
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !certificateData) return;

    setIsDownloading(true);
    try {
      await downloadWeddingCertificateImage(certificateRef.current, {
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
          <DialogTitle>Wedding certificate</DialogTitle>
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
            <WeddingCertificateWithTheme
              spouse1Name={certificateData.spouse1Name}
              spouse2Name={certificateData.spouse2Name}
              marriedAt={certificateData.marriedAt}
              location={certificateData.location}
              officiantName={certificateData.officiantName}
              witnesses={certificateData.witnesses}
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
