"use client";

import { useState } from "react";
import { Droplets, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";
import type { Person } from "@/lib/people";
import { useBaptism } from "@/lib/baptism";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { RecordBaptismDialog } from "@/app/(protected)/water-baptism/_components/record-baptism-dialog";
import { BaptismCertificateDialog } from "@/app/(protected)/water-baptism/_components/baptism-certificate-dialog";
import type { BaptismCertificateData } from "@/app/(protected)/water-baptism/_components/baptism-certificate";
import { EmptyState, panelCard, SectionHeader } from "./person-detail-ui";
import { cn } from "@/lib/utils";

type PersonBaptismSectionProps = {
  person: Person;
  people: Person[];
  baptismRecords: Array<{
    id: string;
    baptizedAt: string;
    location: string;
    officiantName: string | null;
    notes: string;
  }>;
};

export function PersonBaptismSection({
  person,
  people,
  baptismRecords,
}: PersonBaptismSectionProps) {
  const { settings } = useTheme();
  const { settings: orgSettings } = useOrganizationSettings();
  const { isSaving, addRecord } = useBaptism();
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [certificateRecord, setCertificateRecord] = useState<
    (typeof baptismRecords)[number] | null
  >(null);

  if (!orgSettings.waterBaptismEnabled) {
    return null;
  }

  const buildCertificateData = (
    record: (typeof baptismRecords)[number],
  ): BaptismCertificateData => ({
    personName: person.name,
    baptizedAt: record.baptizedAt,
    organizationName: settings.organizationName,
    organizationLogo: settings.organizationLogo,
    location: record.location,
    officiantName: record.officiantName,
  });

  const certificatePreview = certificateRecord
    ? {
        personName: person.name,
        baptizedAt: certificateRecord.baptizedAt,
        location: certificateRecord.location,
        officiantName: certificateRecord.officiantName,
      }
    : null;

  return (
    <>
      <div className={cn(panelCard, "p-5")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            icon={Droplets}
            title="Water Baptism"
            description={
              baptismRecords.length > 0
                ? `${baptismRecords.length} baptism record${baptismRecords.length !== 1 ? "s" : ""}`
                : "No baptism recorded"
            }
          />
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl shrink-0"
            onClick={() => setRecordDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Record baptism
          </Button>
        </div>

        <div className="mt-4">
          {baptismRecords.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="Not baptized on record"
              description="Record a water baptism when this person is baptized."
            />
          ) : (
            <div className="space-y-2">
              {baptismRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 dark:border-zinc-700/70 dark:bg-zinc-800/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(record.baptizedAt).toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                      {index === 0 && baptismRecords.length > 1 && (
                        <Badge variant="secondary" className="rounded-lg">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                      {[
                        record.location || null,
                        record.officiantName
                          ? `Officiant: ${record.officiantName}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No additional details"}
                    </p>
                    {record.notes && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg shrink-0"
                    onClick={() => setCertificateRecord(record)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Certificate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RecordBaptismDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        people={people}
        isSaving={isSaving}
        defaultPersonId={person.id}
        onRecord={addRecord}
      />

      <BaptismCertificateDialog
        open={!!certificateRecord}
        onOpenChange={open => {
          if (!open) setCertificateRecord(null);
        }}
        certificateData={
          certificateRecord ? buildCertificateData(certificateRecord) : null
        }
        preview={certificatePreview}
      />
    </>
  );
}
