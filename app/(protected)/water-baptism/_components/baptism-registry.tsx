"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Droplets, FileText, Plus, Search, X } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { usePeople } from "@/lib/people";
import { useBaptism } from "@/lib/baptism";
import { RecordBaptismDialog } from "./record-baptism-dialog";
import { BaptismCertificateDialog } from "./baptism-certificate-dialog";
import {
  type BaptismCertificateData,
} from "./baptism-certificate";
import {
  buildBaptismRegistryRows,
  DEFAULT_BAPTISM_REGISTRY_FILTERS,
  hasActiveBaptismFilters,
  type BaptismRegistryFilters,
  type BaptismRegistryRow,
} from "../_lib/filters";

function getPersonName(
  people: { id: string; name: string }[],
  personId: string | null,
): string | null {
  if (!personId) return null;
  return people.find(p => p.id === personId)?.name ?? null;
}

export function BaptismRegistry() {
  const router = useRouter();
  const { settings } = useTheme();
  const { people } = usePeople();
  const { records, hydrated, isSaving, addRecord } = useBaptism();
  const [filters, setFilters] = useState<BaptismRegistryFilters>(
    DEFAULT_BAPTISM_REGISTRY_FILTERS,
  );
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [certificateRow, setCertificateRow] = useState<BaptismRegistryRow | null>(
    null,
  );

  const rows = useMemo(
    () => buildBaptismRegistryRows(records, people, filters),
    [records, people, filters],
  );

  const handleOpenCertificate = (row: BaptismRegistryRow) => {
    setCertificateRow(row);
  };

  const buildCertificateData = (
    row: BaptismRegistryRow,
  ): BaptismCertificateData => ({
    personName: row.person.name,
    baptizedAt: row.latestRecord.baptizedAt,
    organizationName: settings.organizationName,
    organizationLogo: settings.organizationLogo,
    location: row.latestRecord.location,
    officiantName: getPersonName(people, row.latestRecord.officiantPersonId),
  });

  const certificatePreview = certificateRow
    ? {
        personName: certificateRow.person.name,
        baptizedAt: certificateRow.latestRecord.baptizedAt,
        location: certificateRow.latestRecord.location,
        officiantName: getPersonName(
          people,
          certificateRow.latestRecord.officiantPersonId,
        ),
      }
    : null;

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading baptism registry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Water Baptism
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">
            Registry of baptized members and certificate generation
          </p>
        </div>
        <Button
          onClick={() => setRecordDialogOpen(true)}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record baptism
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/50">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Total records</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {records.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/50">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Baptized people</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {rows.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/50 sm:col-span-2">
          <p className="text-sm text-slate-500 dark:text-zinc-400">Re-baptisms</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {rows.filter(r => r.recordCount > 1).length}
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
              placeholder="Search by name, location, or notes"
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
          {hasActiveBaptismFilters(filters) && (
            <Button
              variant="outline"
              onClick={() => setFilters(DEFAULT_BAPTISM_REGISTRY_FILTERS)}
              className="rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <Droplets className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600" />
            <p className="mt-4 font-medium text-slate-900 dark:text-white">
              {records.length === 0
                ? "No baptisms recorded yet"
                : "No baptisms match your filters"}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {records.length === 0
                ? "Record your first baptism to start the registry."
                : "Try adjusting your search or date range."}
            </p>
            {records.length === 0 && (
              <Button
                onClick={() => setRecordDialogOpen(true)}
                className="mt-4 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record baptism
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Latest baptism</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Officiant</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.person.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/people/${row.person.id}`}
                        className="hover:underline text-slate-900 dark:text-white"
                      >
                        {row.person.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(row.latestRecord.baptizedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {row.latestRecord.location || "—"}
                    </TableCell>
                    <TableCell>
                      {getPersonName(people, row.latestRecord.officiantPersonId) ||
                        "—"}
                    </TableCell>
                    <TableCell>
                      {row.recordCount > 1 ? (
                        <Badge variant="secondary" className="rounded-lg">
                          {row.recordCount} baptisms
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-lg">
                          Baptized
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => router.push(`/people/${row.person.id}`)}
                        >
                          View profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => handleOpenCertificate(row)}
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

      <RecordBaptismDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        people={people}
        isSaving={isSaving}
        onRecord={addRecord}
      />

      <BaptismCertificateDialog
        open={!!certificateRow}
        onOpenChange={open => {
          if (!open) setCertificateRow(null);
        }}
        certificateData={
          certificateRow ? buildCertificateData(certificateRow) : null
        }
        preview={certificatePreview}
      />
    </div>
  );
}
