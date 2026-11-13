"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DirectoryTitleCard } from "@/components/ui/directory-page-header";
import {
  Droplets,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme-context";
import { usePeople } from "@/lib/people";
import { useBaptism } from "@/lib/baptism";
import { RecordBaptismDialog } from "./record-baptism-dialog";
import { BaptismCertificateDialog } from "./baptism-certificate-dialog";
import type { BaptismCertificateData } from "./baptism-certificate";
import {
  BaptismRegistryCard,
  BaptismRegistryActions,
} from "./baptism-registry-card";
import {
  buildBaptismRegistryRows,
  DEFAULT_BAPTISM_REGISTRY_FILTERS,
  hasActiveBaptismFilters,
  getBaptismRegistryCounts,
  filterBaptismQuickRows,
  formatBaptismDate,
  type BaptismQuickFilter,
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
const accent =
  "bg-[var(--accent-color)] text-[var(--accent-color-foreground)] hover:bg-[var(--accent-color-muted)]";

export function BaptismRegistry() {
  const { settings } = useTheme();
  const { people } = usePeople();
  const { records, hydrated, isSaving, addRecord } = useBaptism();
  const [filters, setFilters] = useState<BaptismRegistryFilters>(
    DEFAULT_BAPTISM_REGISTRY_FILTERS,
  );
  const [quick, setQuick] = useState<BaptismQuickFilter>("all");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [certificateRow, setCertificateRow] =
    useState<BaptismRegistryRow | null>(null);
  const allRows = useMemo(
    () =>
      buildBaptismRegistryRows(
        records,
        people,
        DEFAULT_BAPTISM_REGISTRY_FILTERS,
      ),
    [records, people],
  );
  const counts = getBaptismRegistryCounts(allRows);
  const rows = useMemo(
    () =>
      filterBaptismQuickRows(
        buildBaptismRegistryRows(records, people, filters),
        quick,
      ),
    [records, people, filters, quick],
  );
  const active = hasActiveBaptismFilters(filters) || quick !== "all";
  const invalidRange = Boolean(
    filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo,
  );
  function reset() {
    setFilters(DEFAULT_BAPTISM_REGISTRY_FILTERS);
    setQuick("all");
  }
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

  return (
    <div className="space-y-6">
      <DirectoryTitleCard
        title="Water Baptism"
        description="Registry of baptized members and certificate generation"
        icon={Droplets}
        action={{
          label: "Record baptism",
          icon: Plus,
          onClick: () => setRecordDialogOpen(true),
          disabled: !hydrated || isSaving,
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter baptism registry"
          className="flex flex-wrap gap-2"
        >
          {(
            [
              { key: "all", label: "All Baptized", icon: Droplets },
              { key: "rebaptisms", label: "Re-baptisms", icon: RotateCcw },
              { key: "missing", label: "Details Missing", icon: ClipboardList },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="outline"
              aria-pressed={quick === key}
              onClick={() => setQuick(key)}
              className={cn(
                "min-h-11 gap-2 rounded-xl px-4",
                quick === key && accent,
              )}
            >
              <Icon className="size-4" />
              {label}
              <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-foreground">
                {hydrated ? counts[key] : "—"}
              </span>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            aria-expanded={filtersOpen}
            aria-controls="baptism-date-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="min-h-11 gap-2 rounded-xl"
          >
            <SlidersHorizontal className="size-4" />
            Filters{filters.dateFrom || filters.dateTo ? " (1)" : ""}
          </Button>
          <div
            role="group"
            aria-label="Display mode"
            className="flex rounded-xl bg-[var(--accent-color-soft)] p-1"
          >
            {(
              [
                { key: "cards", label: "Cards", icon: LayoutGrid },
                { key: "table", label: "Table", icon: List },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={cn(
                  "gap-2 rounded-lg",
                  view === key && "bg-card text-foreground shadow-sm",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {filtersOpen && (
        <div
          id="baptism-date-filters"
          className="space-y-3 rounded-xl border bg-card p-4"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full space-y-2 sm:w-48">
              <Label htmlFor="baptism-from">From date</Label>
              <Input
                id="baptism-from"
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={e =>
                  setFilters(prev => ({ ...prev, dateFrom: e.target.value }))
                }
              />
            </div>
            <div className="w-full space-y-2 sm:w-48">
              <Label htmlFor="baptism-to">To date</Label>
              <Input
                id="baptism-to"
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={e =>
                  setFilters(prev => ({ ...prev, dateTo: e.target.value }))
                }
              />
            </div>
            <Button variant="ghost" onClick={reset}>
              Reset filters
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Dates and missing details refer to each person’s latest baptism.
            Missing details means the location or officiant has not been
            recorded.
          </p>
          {invalidRange && (
            <p role="alert" className="text-sm text-destructive">
              From date must be on or before To date.
            </p>
          )}
        </div>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search baptism registry"
          value={filters.search}
          onChange={e =>
            setFilters(prev => ({ ...prev, search: e.target.value }))
          }
          placeholder="Search by name, location, or notes..."
          className="h-12 rounded-xl bg-muted/40 pl-12"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span role="status">
          {hydrated
            ? `${rows.length} baptized people · ${records.length} total records`
            : "Loading baptism registry..."}
        </span>
        {active && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear all
          </Button>
        )}
      </div>
      {!hydrated ? (
        <div
          role="status"
          aria-label="Loading baptism registry"
          aria-busy="true"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {[0, 1, 2].map(i => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div
          role="status"
          className="rounded-2xl border bg-card p-8 text-center"
        >
          <Droplets className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {allRows.length === 0
              ? "No baptisms recorded yet"
              : "No baptisms match your filters"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {allRows.length === 0
              ? "Record your first baptism to start the registry."
              : "Try adjusting your search or date range."}
          </p>
          <Button
            className={cn("mt-4", accent)}
            onClick={
              allRows.length === 0 ? () => setRecordDialogOpen(true) : reset
            }
          >
            {allRows.length === 0 ? "Record baptism" : "Clear all"}
          </Button>
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(row => (
            <BaptismRegistryCard
              key={row.person.id}
              row={row}
              officiant={getPersonName(
                people,
                row.latestRecord.officiantPersonId,
              )}
              onCertificate={handleOpenCertificate}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Latest baptism</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Officiant</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.person.id}>
                  <TableCell className="min-w-40 max-w-xs break-words font-medium">
                    <Link
                      href={`/people/${row.person.id}`}
                      className="hover:underline"
                    >
                      {row.person.name}
                    </Link>
                  </TableCell>
                  <TableCell className="min-w-36">
                    {formatBaptismDate(row.latestRecord.baptizedAt)}
                  </TableCell>
                  <TableCell className="min-w-40 max-w-xs break-words">
                    {row.latestRecord.location.trim() || "Not recorded"}
                  </TableCell>
                  <TableCell className="min-w-36 max-w-xs break-words">
                    {getPersonName(
                      people,
                      row.latestRecord.officiantPersonId,
                    ) || "Not recorded"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.recordCount > 1 ? "secondary" : "outline"}
                    >
                      {row.recordCount > 1
                        ? `${row.recordCount} baptisms`
                        : "Baptized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-72">
                    <BaptismRegistryActions
                      row={row}
                      onCertificate={handleOpenCertificate}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
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
