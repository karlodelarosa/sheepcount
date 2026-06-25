"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  DollarSign,
  Plus,
  Printer,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OverviewStatCard } from "@/components/overview-stat-card";
import { DEFAULT_CURRENCY, formatCurrency, type SupportedCurrency } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { useEntitlements } from "@/lib/subscription/use-entitlements";
import { isItemEnabled } from "@/lib/subscription/entitlements";
import {
  computeAuditChartData,
  computeAuditSummary,
  getAuditEntries,
} from "../_lib/audit-overview";
import { useFinancialAudits } from "../financial-context";
import { ChartPanel, ChartEmpty } from "./chart-panel";
import { AddAuditEntryDialog } from "./add-audit-entry-dialog";
import { PrintReportDialog } from "./print-report-dialog";

interface AuditDetailViewProps {
  auditId: string;
}

function CurrencyTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  currency: SupportedCurrency;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 text-xs">
      <p className="font-medium text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map(entry => (
        <p key={entry.name} className="text-slate-600 dark:text-zinc-400">
          {entry.name}: {formatCurrency(entry.value ?? 0, currency)}
        </p>
      ))}
    </div>
  );
}

export function AuditDetailView({ auditId }: AuditDetailViewProps) {
  const router = useRouter();
  const { entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { settings: orgSettings } = useOrganizationSettings();
  const financialEnabled = isItemEnabled(entitlements.modules, "financial");
  const currency = orgSettings.currency ?? DEFAULT_CURRENCY;

  const {
    getAuditById,
    auditIncome,
    auditExpenses,
    addAuditIncome,
    addAuditExpense,
    hydrated,
  } = useFinancialAudits();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  const audit = getAuditById(auditId);

  const { income, expenses } = useMemo(
    () => getAuditEntries(auditId, auditIncome, auditExpenses),
    [auditId, auditIncome, auditExpenses],
  );

  const summary = useMemo(
    () => computeAuditSummary(income, expenses),
    [income, expenses],
  );

  const chartData = useMemo(
    () => computeAuditChartData(income, expenses),
    [income, expenses],
  );

  const expenseChartData = useMemo(() => {
    const items = chartData.expenseBreakdown;
    if (items.length === 0) return chartData.comparison;
    return items.map(item => ({
      name: item.name,
      income: 0,
      expenses: item.value,
    }));
  }, [chartData]);

  const handlePrint = () => {
    if (!audit) return;
    setIsPrintDialogOpen(true);
  };

  if (entitlementsLoading || !hydrated) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!financialEnabled) {
    router.replace("/financial");
    return null;
  }

  if (!audit) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/financial?tab=audits")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to audits
        </Button>
        <p className="text-slate-500">Audit schedule not found.</p>
      </div>
    );
  }

  const sortedIncome = [...income].sort((a, b) => b.date.localeCompare(a.date));
  const sortedExpenses = [...expenses].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-slate-600"
            onClick={() => router.push("/financial?tab=audits")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            All audits
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {audit.title}
          </h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 dark:text-zinc-400">
            <Calendar className="w-4 h-4" />
            Schedule date:{" "}
            {new Date(audit.scheduleDate).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={handlePrint} className="rounded-lg">
            <Printer className="w-4 h-4 mr-2" />
            Print report
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-xl bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add entry
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <OverviewStatCard
          label="Total Receipts"
          value={formatCurrency(summary.totalIncome, currency)}
          hint={`${summary.incomeCount} entries`}
          icon={ArrowUpCircle}
          variant="emerald"
        />
        <OverviewStatCard
          label="Total Expenses"
          value={formatCurrency(summary.totalExpenses, currency)}
          hint={`${summary.expenseCount} entries`}
          icon={ArrowDownCircle}
          variant="rose"
        />
        <OverviewStatCard
          label="Net Balance"
          value={formatCurrency(summary.netBalance, currency)}
          hint="Receipts minus expenses"
          icon={DollarSign}
          variant={summary.netBalance >= 0 ? "emerald" : "rose"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel
          title="Receipts vs Expenses"
          description="Total comparison for this audit"
        >
          {summary.totalIncome === 0 && summary.totalExpenses === 0 ? (
            <ChartEmpty message="Add entries to see the comparison." />
          ) : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.comparison}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={v =>
                      formatCurrency(v as number, currency).replace(
                        /\.\d+$/,
                        "",
                      )
                    }
                  />
                  <Tooltip content={<CurrencyTooltip currency={currency} />} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Receipts"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          title="Expenses by category"
          description="Electricity, rent, resources, and more"
        >
          {chartData.expenseBreakdown.length === 0 ? (
            <ChartEmpty message="No expenses recorded yet." />
          ) : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseChartData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    tickFormatter={v =>
                      formatCurrency(v as number, currency).replace(
                        /\.\d+$/,
                        "",
                      )
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CurrencyTooltip currency={currency} />} />
                  <Bar dataKey="expenses" name="Amount" radius={[0, 4, 4, 0]}>
                    {expenseChartData.map(entry => {
                      const color =
                        chartData.expenseBreakdown.find(
                          b => b.name === entry.name,
                        )?.fill ?? "#94a3b8";
                      return <Cell key={entry.name} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200/60 dark:border-zinc-700/60">
          <CardHeader className="py-3 px-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Receipt entries ({income.length})
            </h2>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-2">
            {sortedIncome.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No receipt entries yet
              </p>
            ) : (
              sortedIncome.map(line => (
                <div
                  key={line.id}
                  className="flex items-start justify-between gap-3 py-2 px-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="rounded-lg bg-blue-500">{line.type}</Badge>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {line.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(line.date).toLocaleDateString("en-PH")} ·{" "}
                      {line.paymentMethod}
                      {line.notes ? ` · ${line.notes}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 tabular-nums shrink-0">
                    +{formatCurrency(line.amount, currency)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 dark:border-zinc-700/60">
          <CardHeader className="py-3 px-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Expense entries ({expenses.length})
            </h2>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-2">
            {sortedExpenses.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No expense entries yet
              </p>
            ) : (
              sortedExpenses.map(line => (
                <div
                  key={line.id}
                  className="flex items-start justify-between gap-3 py-2 px-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="rounded-lg">
                        {line.category}
                      </Badge>
                      {line.description ? (
                        <span className="text-sm text-slate-700 dark:text-zinc-300 truncate">
                          {line.description}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(line.date).toLocaleDateString("en-PH")} ·{" "}
                      {line.paymentMethod} · {line.vendor}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-rose-600 tabular-nums shrink-0">
                    -{formatCurrency(line.amount, currency)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <AddAuditEntryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        auditId={auditId}
        currency={currency}
        onSubmitIncome={addAuditIncome}
        onSubmitExpense={addAuditExpense}
      />

      {audit ? (
        <PrintReportDialog
          open={isPrintDialogOpen}
          onOpenChange={setIsPrintDialogOpen}
          audit={audit}
          income={income}
          expenses={expenses}
          summary={summary}
          currency={currency}
        />
      ) : null}
    </div>
  );
}
