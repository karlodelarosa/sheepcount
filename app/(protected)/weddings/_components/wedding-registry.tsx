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
import { Heart, FileText } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useWedding } from "@/lib/weddings";
import { RecordWeddingDialog } from "./record-wedding-dialog";
import { WeddingCertificateDialog } from "./wedding-certificate-dialog";
import type { WeddingCertificateData } from "./wedding-certificate";
import type { WeddingRecord } from "@/lib/supabase/weddings";
import {
  DEFAULT_WEDDING_REGISTRY_FILTERS,
  filterWeddingRecords,
  type WeddingRegistryFilters,
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

export function WeddingRegistry() {
  const { settings } = useTheme();
  const { records, hydrated, isSaving, addRecord } = useWedding();
  const [filters, setFilters] = useState<WeddingRegistryFilters>(
    DEFAULT_WEDDING_REGISTRY_FILTERS,
  );
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [certificateRecord, setCertificateRecord] =
    useState<WeddingRecord | null>(null);

  const [quick, setQuick] = useState<LifeEventQuickFilter>("all");
  const year = new Date().getFullYear();
  const counts = getLifeEventCounts(records, record => record.marriedAt, year);

  const rows = useMemo(
    () =>
      filterLifeEventQuickRecords(
        filterWeddingRecords(records, filters),
        quick,
        record => record.marriedAt,
        year,
      ),
    [records, filters, quick, year],
  );

  const certificateData: WeddingCertificateData | null = certificateRecord
    ? {
        spouse1Name: certificateRecord.spouse1Name,
        spouse2Name: certificateRecord.spouse2Name,
        marriedAt: certificateRecord.marriedAt,
        organizationName: settings.organizationName,
        organizationLogo: settings.organizationLogo,
        location: certificateRecord.location,
        officiantName: certificateRecord.officiantName,
        witnesses: certificateRecord.witnesses,
      }
    : null;

  return (
    <>
      <LifeEventRegistryLayout
        title="Weddings"
        description="Registry of weddings and certificate generation"
        icon={Heart}
        recordLabel="Record wedding"
        hydrated={hydrated}
        isSaving={isSaving}
        onRecord={() => setRecordDialogOpen(true)}
        filters={filters}
        onFiltersChange={setFilters}
        quick={quick}
        onQuickChange={setQuick}
        counts={counts}
        resultCount={rows.length}
        searchPlaceholder="Search by couple, officiant, location, or notes..."
        dateHelp="Dates refer to the wedding date."
      >
        {view =>
          view === "cards" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map(record => (
                <LifeEventRecordCard
                  key={record.id}
                  title={`${record.spouse1Name} & ${record.spouse2Name}`}
                  subtitle="Wedding"
                  icon={Heart}
                  date={formatLifeEventDate(record.marriedAt)}
                  dateLabel="Wedding date"
                  location={record.location}
                  officiant={record.officiantName}
                  notes={record.notes}
                  onCertificate={() => setCertificateRecord(record)}
                ></LifeEventRecordCard>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Couple</TableHead>
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
                        {record.spouse1Name} &amp; {record.spouse2Name}
                      </TableCell>
                      <TableCell className="min-w-36 max-w-xs break-words">
                        {formatLifeEventDate(record.marriedAt)}
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
      <RecordWeddingDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        isSaving={isSaving}
        onRecord={addRecord}
      />

      <WeddingCertificateDialog
        open={!!certificateRecord}
        onOpenChange={open => {
          if (!open) setCertificateRecord(null);
        }}
        certificateData={certificateData}
      />
    </>
  );
}
