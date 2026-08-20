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
import { Heart, FileText, Plus, Search, X } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useWedding } from "@/lib/weddings";
import { RecordWeddingDialog } from "./record-wedding-dialog";
import { WeddingCertificateDialog } from "./wedding-certificate-dialog";
import type { WeddingCertificateData } from "./wedding-certificate";
import type { WeddingRecord } from "@/lib/supabase/weddings";
import {
  DEFAULT_WEDDING_REGISTRY_FILTERS,
  filterWeddingRecords,
  hasActiveWeddingFilters,
  type WeddingRegistryFilters,
} from "../_lib/filters";

export function WeddingRegistry() {
  const { settings } = useTheme();
  const { records, hydrated, isSaving, addRecord } = useWedding();
  const [filters, setFilters] = useState<WeddingRegistryFilters>(
    DEFAULT_WEDDING_REGISTRY_FILTERS,
  );
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [certificateRecord, setCertificateRecord] =
    useState<WeddingRecord | null>(null);

  const rows = useMemo(
    () => filterWeddingRecords(records, filters),
    [records, filters],
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

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading wedding registry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Weddings
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Registry of weddings and certificate generation
          </p>
        </div>
        <Button
          onClick={() => setRecordDialogOpen(true)}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record wedding
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/50">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Total weddings
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
                  new Date(r.marriedAt).getFullYear() ===
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
          {hasActiveWeddingFilters(filters) && (
            <Button
              variant="outline"
              onClick={() => setFilters(DEFAULT_WEDDING_REGISTRY_FILTERS)}
              className="rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <Heart className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">
              {records.length === 0
                ? "No weddings recorded yet"
                : "No weddings match your filters"}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {records.length === 0
                ? "Record your first wedding to start the registry."
                : "Try adjusting your search or date range."}
            </p>
            {records.length === 0 && (
              <Button
                onClick={() => setRecordDialogOpen(true)}
                className="mt-4 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record wedding
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {record.spouse1Name} &amp; {record.spouse2Name}
                    </TableCell>
                    <TableCell>
                      {new Date(record.marriedAt).toLocaleDateString()}
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
    </div>
  );
}
