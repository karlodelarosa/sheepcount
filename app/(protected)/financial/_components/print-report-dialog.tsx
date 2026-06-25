"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonSelect } from "@/components/person-select";
import { useTenant } from "@/app/providers/tenant-provider";
import { usePeople } from "@/lib/people";
import type { SupportedCurrency } from "@/lib/currency";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
} from "../_lib/types";
import type { AuditPrintOrganization, AuditSummary, ReportSignatory } from "../_lib/audit-overview";
import { openFinancialAuditReportPrint } from "../_lib/financial-print";

type SignatoryRow = {
  label: string;
  mode: "person" | "manual";
  personId: string;
  manualName: string;
};

const DEFAULT_SIGNATORY_ROWS: SignatoryRow[] = [
  { label: "Prepared by", mode: "manual", personId: "", manualName: "" },
  { label: "Reviewed by", mode: "manual", personId: "", manualName: "" },
  { label: "Approved by", mode: "manual", personId: "", manualName: "" },
];

interface PrintReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audit: AuditSchedule;
  income: AuditIncomeEntry[];
  expenses: AuditExpenseEntry[];
  summary: AuditSummary;
  currency: SupportedCurrency;
}

function getOrganizationFromTenant(
  tenant: ReturnType<typeof useTenant>["tenant"],
): AuditPrintOrganization {
  const org =
    tenant?.organizations?.[0] ?? tenant?.tenant.organizations?.[0] ?? null;

  return {
    name: org?.name ?? tenant?.tenant.name ?? "Church",
    address: org?.address ?? "",
    phone: org?.phone ?? "",
    logoUrl: org?.image || null,
  };
}

function resolveSignatories(
  rows: SignatoryRow[],
  peopleById: Map<string, string>,
): ReportSignatory[] {
  return rows.map(row => {
    const name =
      row.mode === "person" && row.personId
        ? (peopleById.get(row.personId) ?? "")
        : row.manualName.trim();
    return { label: row.label.trim() || "Signatory", name };
  });
}

export function PrintReportDialog({
  open,
  onOpenChange,
  audit,
  income,
  expenses,
  summary,
  currency,
}: PrintReportDialogProps) {
  const { tenant } = useTenant();
  const { people, hydrated } = usePeople();
  const organization = useMemo(
    () => getOrganizationFromTenant(tenant),
    [tenant],
  );

  const [rows, setRows] = useState<SignatoryRow[]>(DEFAULT_SIGNATORY_ROWS);

  useEffect(() => {
    if (open) {
      setRows(DEFAULT_SIGNATORY_ROWS.map(row => ({ ...row })));
    }
  }, [open]);

  const peopleById = useMemo(
    () => new Map(people.map(person => [person.id, person.name])),
    [people],
  );

  const updateRow = (index: number, patch: Partial<SignatoryRow>) => {
    setRows(prev =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const handlePrint = () => {
    openFinancialAuditReportPrint({
      audit,
      income,
      expenses,
      summary,
      currency,
      organization,
      signatories: resolveSignatories(rows, peopleById),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Print financial report</DialogTitle>
          <DialogDescription>
            The report includes your organization logo, name, address, and
            phone, followed by the audit details and signatories.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-3 dark:border-zinc-700/70 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            {organization.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organization.logoUrl}
                alt=""
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center text-lg font-semibold shrink-0">
                {organization.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {organization.name}
              </p>
              {organization.address ? (
                <p className="text-slate-500 dark:text-zinc-400 truncate">
                  {organization.address}
                </p>
              ) : null}
              {organization.phone ? (
                <p className="text-slate-500 dark:text-zinc-400">
                  {organization.phone}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Signatories
          </p>
          {rows.map((row, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-slate-200/60 p-3 dark:border-zinc-700/60"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`sig-label-${index}`}>Role / label</Label>
                <Input
                  id={`sig-label-${index}`}
                  value={row.label}
                  onChange={e => updateRow(index, { label: e.target.value })}
                  placeholder="Prepared by"
                  className="rounded-lg"
                />
              </div>

              <Tabs
                value={row.mode}
                onValueChange={value =>
                  updateRow(index, {
                    mode: value as "person" | "manual",
                    personId: "",
                    manualName: "",
                  })
                }
              >
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="person" className="text-xs">
                    From People
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-xs">
                    Manual name
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {row.mode === "person" ? (
                <PersonSelect
                  people={people}
                  value={row.personId || undefined}
                  onValueChange={value =>
                    updateRow(index, { personId: value })
                  }
                  placeholder={
                    hydrated ? "Select a person" : "Loading people..."
                  }
                  disabled={!hydrated}
                />
              ) : (
                <Input
                  value={row.manualName}
                  onChange={e =>
                    updateRow(index, { manualName: e.target.value })
                  }
                  placeholder="Enter name"
                  className="rounded-lg"
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-slate-900 hover:bg-slate-800"
          >
            Print report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
