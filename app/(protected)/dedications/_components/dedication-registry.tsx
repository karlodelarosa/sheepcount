"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Baby, FileText } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useDedication } from "@/lib/dedications";
import { RecordDedicationDialog } from "./record-dedication-dialog";
import { DedicationCertificateDialog } from "./dedication-certificate-dialog";
import type { DedicationCertificateData } from "./dedication-certificate";
import type { DedicationRecord } from "@/lib/supabase/dedications";
import {
  DEFAULT_DEDICATION_REGISTRY_FILTERS,
  filterDedicationRecords,
  type DedicationRegistryFilters,
} from "../_lib/filters";

import {
  LifeEventRegistryLayout,
  LifeEventRecordCard,
} from "@/components/life-event-registry";
import {
  filterLifeEventQuickRecords,
  getLifeEventCounts,
  formatLifeEventDate,
  type LifeEventQuickFilter,
} from "@/lib/life-event-registry";

export function DedicationRegistry() {
  const { settings } = useTheme();
  const { records, hydrated, isSaving, addRecord } = useDedication();
  const [filters, setFilters] = useState<DedicationRegistryFilters>(
    DEFAULT_DEDICATION_REGISTRY_FILTERS,
  );
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [certificateRecord, setCertificateRecord] =
    useState<DedicationRecord | null>(null);

  const [quick, setQuick] = useState<LifeEventQuickFilter>("all");
  const year = new Date().getFullYear();
  const counts = getLifeEventCounts(
    records,
    record => record.dedicatedAt,
    year,
  );

  const rows = useMemo(
    () =>
      filterLifeEventQuickRecords(
        filterDedicationRecords(records, filters),
        quick,
        record => record.dedicatedAt,
        year,
      ),
    [records, filters, quick, year],
  );

  const certificateData: DedicationCertificateData | null = certificateRecord
    ? {
        childName: certificateRecord.childName,
        dedicatedAt: certificateRecord.dedicatedAt,
        organizationName: settings.organizationName,
        organizationLogo: settings.organizationLogo,
        location: certificateRecord.location,
        officiantName: certificateRecord.officiantName,
        parentNames: certificateRecord.parentNames,
        sponsors: certificateRecord.sponsors,
      }
    : null;

  return (
    <>
      <LifeEventRegistryLayout
        title="Child Dedication"
        description="Registry of child dedications and certificate generation"
        icon={Baby}
        recordLabel="Record dedication"
        hydrated={hydrated}
        isSaving={isSaving}
        onRecord={() => setRecordDialogOpen(true)}
        filters={filters}
        onFiltersChange={setFilters}
        quick={quick}
        onQuickChange={setQuick}
        counts={counts}
        resultCount={rows.length}
        searchPlaceholder="Search by child, parents, officiant, location, or notes..."
        dateHelp="Dates refer to the dedication date."
      >
        {view =>
          view === "cards" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map(record => (
                <LifeEventRecordCard
                  key={record.id}
                  title={record.childName}
                  subtitle="Child dedication"
                  icon={Baby}
                  date={formatLifeEventDate(record.dedicatedAt)}
                  dateLabel="Dedication date"
                  location={record.location}
                  officiant={record.officiantName}
                  notes={record.notes}
                  onCertificate={() => setCertificateRecord(record)}
                >
                  <p className="break-words">
                    Parents: {record.parentNames || "Not recorded"}
                  </p>
                </LifeEventRecordCard>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child</TableHead>
                    <TableHead>Parent(s)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Officiant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="min-w-40 max-w-xs break-words font-medium text-foreground">
                        {record.childName}
                      </TableCell>
                      <TableCell className="min-w-36 max-w-xs break-words">
                        {record.parentNames || "—"}
                      </TableCell>
                      <TableCell className="min-w-36 max-w-xs break-words">
                        {formatLifeEventDate(record.dedicatedAt)}
                      </TableCell>
                      <TableCell className="min-w-36 max-w-xs break-words">
                        {record.location || "—"}
                      </TableCell>
                      <TableCell className="min-w-36 max-w-xs break-words">
                        {record.officiantName || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 rounded-xl border-[var(--accent-color-border)] text-[var(--accent-color-strong)] dark:text-[var(--accent-color)]"
                            onClick={() => setCertificateRecord(record)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Certificate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        }
      </LifeEventRegistryLayout>
      <RecordDedicationDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        isSaving={isSaving}
        onRecord={addRecord}
      />

      <DedicationCertificateDialog
        open={!!certificateRecord}
        onOpenChange={open => {
          if (!open) setCertificateRecord(null);
        }}
        certificateData={certificateData}
      />
    </>
  );
}
