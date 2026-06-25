"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Printer, RotateCcw, Trash2 } from "lucide-react";
import { useTenant } from "@/app/providers/tenant-provider";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { getAllBorrows, type PropertyBorrow } from "@/lib/supabase/properties";
import type { ChurchProperty } from "@/lib/supabase/properties";
import {
  openBorrowFormPrint,
  type BorrowFormOrganization,
} from "../_lib/borrow-form-print";
import { ReturnBorrowDialog } from "./return-borrow-dialog";

function getOrganizationFromTenant(
  tenant: ReturnType<typeof useTenant>["tenant"],
): BorrowFormOrganization {
  const org =
    tenant?.organizations?.[0] ?? tenant?.tenant.organizations?.[0] ?? null;

  return {
    name: org?.name ?? tenant?.tenant.name ?? "Church",
    address: org?.address ?? "",
    phone: org?.phone ?? "",
    logoUrl: org?.image || null,
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}

export function BorrowLogTable({
  properties,
  isAdmin,
  onReturn,
  onDelete,
}: {
  properties: ChurchProperty[];
  isAdmin: boolean;
  onReturn: (
    borrow: PropertyBorrow,
    propertyId: string,
    returnedAt: string,
  ) => Promise<boolean>;
  onDelete: (borrowId: string, propertyId: string) => Promise<boolean>;
}) {
  const { tenant } = useTenant();
  const { settings } = useOrganizationSettings();
  const currency = settings.currency ?? DEFAULT_CURRENCY;
  const organization = getOrganizationFromTenant(tenant);

  const borrowRows = useMemo(() => getAllBorrows(properties), [properties]);

  const [returnTarget, setReturnTarget] = useState<{
    borrow: PropertyBorrow;
    property: ChurchProperty;
  } | null>(null);

  if (borrowRows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/60 bg-card py-16 text-center text-slate-500 dark:text-zinc-400">
        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-zinc-600" />
        <p>No borrow records yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/60 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-zinc-800/50">
              <TableHead>Property</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Borrow date</TableHead>
              <TableHead>Expected return</TableHead>
              <TableHead>Return date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowRows.map(row => {
              const isActive = !row.returnedAt;
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.property.name}</TableCell>
                  <TableCell>{row.borrowerName}</TableCell>
                  <TableCell>{formatDate(row.borrowedAt)}</TableCell>
                  <TableCell>{formatDate(row.dueAt)}</TableCell>
                  <TableCell>{formatDate(row.returnedAt)}</TableCell>
                  <TableCell>
                    {isActive ? (
                      <Badge className="rounded-lg bg-amber-500 hover:bg-amber-500">
                        Out
                      </Badge>
                    ) : (
                      <Badge className="rounded-lg bg-emerald-500 hover:bg-emerald-500">
                        Returned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Print borrow form"
                        onClick={() =>
                          openBorrowFormPrint({
                            organization,
                            property: row.property,
                            borrow: row,
                            currency,
                          })
                        }
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      {isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Mark returned"
                          onClick={() =>
                            setReturnTarget({
                              borrow: row,
                              property: row.property,
                            })
                          }
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-600"
                          title="Delete record"
                          onClick={() => void onDelete(row.id, row.propertyId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {returnTarget && (
        <ReturnBorrowDialog
          open
          onOpenChange={open => {
            if (!open) setReturnTarget(null);
          }}
          borrow={returnTarget.borrow}
          propertyName={returnTarget.property.name}
          onConfirm={async returnedAt => {
            const ok = await onReturn(
              returnTarget.borrow,
              returnTarget.property.id,
              returnedAt,
            );
            if (ok) setReturnTarget(null);
            return ok;
          }}
        />
      )}
    </>
  );
}
