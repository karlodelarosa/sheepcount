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
import { Cross, FileText } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { usePeople } from "@/lib/people";
import { useMemorial } from "@/lib/memorials";
import { RecordMemorialDialog } from "./record-memorial-dialog";
import { MemorialCertificateDialog } from "./memorial-certificate-dialog";
import type { MemorialCertificateData } from "./memorial-certificate";
import type { MemorialRecord } from "@/lib/supabase/memorials";
import {
  DEFAULT_MEMORIAL_REGISTRY_FILTERS,
  filterMemorialRecords,
  type MemorialRegistryFilters,
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

export function MemorialRegistry() {
  const { settings } = useTheme();
  const { people } = usePeople();
  const { records, hydrated, isSaving, addRecord } = useMemorial();
  const [filters, setFilters] = useState<MemorialRegistryFilters>(
    DEFAULT_MEMORIAL_REGISTRY_FILTERS,
  );
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [certificateRecord, setCertificateRecord] =
    useState<MemorialRecord | null>(null);

  const [quick, setQuick] = useState<LifeEventQuickFilter>("all");
  const year = new Date().getFullYear();
  const counts = getLifeEventCounts(records, record => record.deathDate, year);

  const rows = useMemo(
    () =>
      filterLifeEventQuickRecords(
        filterMemorialRecords(records, filters),
        quick,
        record => record.deathDate,
        year,
      ),
    [records, filters, quick, year],
  );

  const certificateData: MemorialCertificateData | null = certificateRecord
    ? {
        deceasedName: certificateRecord.deceasedName,
        deathDate: certificateRecord.deathDate,
        organizationName: settings.organizationName,
        organizationLogo: settings.organizationLogo,
        location: certificateRecord.location,
        officiantName: certificateRecord.officiantName,
        survivedBy: certificateRecord.survivedBy,
      }
    : null;

  return (
    <>
      <LifeEventRegistryLayout
        title="Memorial Records"
        description="In loving memory of those who have gone before us"
        icon={Cross}
        recordLabel="Record memorial"
        hydrated={hydrated}
        isSaving={isSaving}
        onRecord={() => setRecordDialogOpen(true)}
        filters={filters}
        onFiltersChange={setFilters}
        quick={quick}
        onQuickChange={setQuick}
        counts={counts}
        resultCount={rows.length}
        searchPlaceholder="Search by name, officiant, location, family, or notes..."
        dateHelp="Dates and This Year refer to the date of passing."
      >
        {view =>
          view === "cards" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map(record => (
                <LifeEventRecordCard
                  key={record.id}
                  title={record.deceasedName}
                  subtitle="In loving memory"
                  icon={Cross}
                  date={formatLifeEventDate(record.deathDate)}
                  dateLabel="Date of passing"
                  location={record.location}
                  officiant={record.officiantName}
                  notes={record.notes}
                  onCertificate={() => setCertificateRecord(record)}
                >
                  <p>
                    Memorial service:{" "}
                    {record.serviceDate
                      ? formatLifeEventDate(record.serviceDate)
                      : "Not recorded"}
                  </p>
                  {record.survivedBy && (
                    <p className="break-words">
                      Survived by: {record.survivedBy}
                    </p>
                  )}
                </LifeEventRecordCard>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date of passing</TableHead>
                    <TableHead>Service date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Officiant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="min-w-40 max-w-xs break-words font-medium text-foreground">
                        {record.deceasedName}
                      </TableCell>
                      <TableCell className="min-w-36 max-w-xs break-words">
                        {formatLifeEventDate(record.deathDate)}
                      </TableCell>
                      <TableCell className="min-w-36 max-w-xs break-words">
                        {record.serviceDate
                          ? formatLifeEventDate(record.serviceDate)
                          : "—"}
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
      <RecordMemorialDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        people={people}
        isSaving={isSaving}
        onRecord={addRecord}
      />

      <MemorialCertificateDialog
        open={!!certificateRecord}
        onOpenChange={open => {
          if (!open) setCertificateRecord(null);
        }}
        certificateData={certificateData}
      />
    </>
  );
}
