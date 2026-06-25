"use client";

import Link from "next/link";
import { Calendar, ChevronRight, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import {
  computeAuditSummary,
  getAuditEntries,
} from "../_lib/audit-overview";
import type { AuditSchedule } from "../_lib/types";
import type { AuditExpenseEntry, AuditIncomeEntry } from "../_lib/types";

interface AuditsTabProps {
  audits: AuditSchedule[];
  auditIncome: AuditIncomeEntry[];
  auditExpenses: AuditExpenseEntry[];
  currency: SupportedCurrency;
  onCreateAudit: () => void;
}

export function AuditsTab({
  audits,
  auditIncome,
  auditExpenses,
  currency,
  onCreateAudit,
}: AuditsTabProps) {
  const sortedAudits = [...audits].sort(
    (a, b) =>
      new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Audit schedules
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Create a schedule, then add receipt and expense entries on the detail
            page
          </p>
        </div>
        <Button
          onClick={onCreateAudit}
          className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New schedule
        </Button>
      </div>

      {sortedAudits.length === 0 ? (
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60">
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
            <p className="mt-4 text-slate-600 dark:text-zinc-400">
              No audit schedules yet
            </p>
            <Button onClick={onCreateAudit} className="mt-4 rounded-lg">
              Create your first schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedAudits.map(audit => {
            const { income, expenses } = getAuditEntries(
              audit.id,
              auditIncome,
              auditExpenses,
            );
            const summary = computeAuditSummary(income, expenses);

            return (
              <Link
                key={audit.id}
                href={`/financial/${audit.id}`}
                className="block group"
              >
                <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm hover:shadow-md hover:border-slate-300/80 transition-all dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:hover:border-zinc-600/80">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {audit.title}
                          </h3>
                          <Badge variant="secondary" className="rounded-lg text-xs">
                            {income.length + expenses.length} entries
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-zinc-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(audit.scheduleDate).toLocaleDateString(
                            "en-PH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Receipts {formatCurrency(summary.totalIncome, currency)}
                          </span>
                          <span className="text-rose-600 dark:text-rose-400">
                            Expenses{" "}
                            {formatCurrency(summary.totalExpenses, currency)}
                          </span>
                          <span
                            className={
                              summary.netBalance >= 0
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-rose-700 dark:text-rose-300"
                            }
                          >
                            Net {formatCurrency(summary.netBalance, currency)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
