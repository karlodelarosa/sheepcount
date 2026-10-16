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
import { Input } from "@/components/ui/input";
import { Cross, FileText, Plus, Search, X } from "lucide-react";
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
  hasActiveMemorialFilters,
  type MemorialRegistryFilters,
} from "../_lib/filters";

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

  const rows = useMemo(
    () => filterMemorialRecords(records, filters),
    [records, filters],
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

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading memorial registry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Memorial Records
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            In loving memory of those who have gone before us
          </p>
        </div>
        <Button
          onClick={() => setRecordDialogOpen(true)}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record memorial
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/50">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Total records
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {records.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/50">
          <p className="text-sm text-slate-500 dark:text-zinc-400">This year</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {
              records.filter(
                r =>
                  new Date(r.deathDate).getFullYear() ===
                  new Date().getFullYear(),
              ).length
            }
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/50 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search by name, officiant, location, or notes"
              className="pl-9 rounded-xl"
            />
          </div>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={e =>
              setFilters(prev => ({ ...prev, dateFrom: e.target.value }))
            }
            className="rounded-xl lg:w-40"
            aria-label="From date"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={e =>
              setFilters(prev => ({ ...prev, dateTo: e.target.value }))
            }
            className="rounded-xl lg:w-40"
            aria-label="To date"
          />
          {hasActiveMemorialFilters(filters) && (
            <Button
              variant="outline"
              onClick={() => setFilters(DEFAULT_MEMORIAL_REGISTRY_FILTERS)}
              className="rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <Cross className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">
              {records.length === 0
                ? "No memorial records yet"
                : "No memorial records match your filters"}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {records.length === 0
                ? "Record a memorial to start the registry."
                : "Try adjusting your search or date range."}
            </p>
            {records.length === 0 && (
              <Button
                onClick={() => setRecordDialogOpen(true)}
                className="mt-4 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record memorial
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {record.deceasedName}
                    </TableCell>
                    <TableCell>
                      {new Date(record.deathDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {record.serviceDate
                        ? new Date(record.serviceDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>{record.location || "—"}</TableCell>
                    <TableCell>{record.officiantName || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
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
        )}
      </div>

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
    </div>
  );
}
