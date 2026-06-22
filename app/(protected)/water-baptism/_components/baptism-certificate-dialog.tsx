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
import {
  BaptismCertificateWithTheme,
  downloadBaptismCertificateImage,
  openBaptismCertificatePrint,
  type BaptismCertificateData,
} from "./baptism-certificate";

type BaptismCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateData: BaptismCertificateData | null;
  preview: {
    personName: string;
    baptizedAt: string;
    location?: string;
    officiantName?: string | null;
  } | null;
};

export function BaptismCertificateDialog({
  open,
  onOpenChange,
  certificateData,
  preview,
}: BaptismCertificateDialogProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    if (!certificateData) return;
    openBaptismCertificatePrint(certificateData);
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !certificateData) return;

    setIsDownloading(true);
    try {
      await downloadBaptismCertificateImage(
        certificateRef.current,
        certificateData,
      );
    } catch {
      toast.error("Could not download certificate image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Baptism certificate</DialogTitle>
        </DialogHeader>
        {preview && (
          <div ref={certificateRef}>
            <BaptismCertificateWithTheme
              personName={preview.personName}
              baptizedAt={preview.baptizedAt}
              location={preview.location}
              officiantName={preview.officiantName}
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
