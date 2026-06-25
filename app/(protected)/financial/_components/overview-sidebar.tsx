"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronRight,
  ClipboardList,
  History,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import type { FinancialSuggestion } from "../_lib/financial-overview";
import type { OverviewSidebarData } from "../_lib/overview-sidebar";
import { SuggestionsStrip } from "./suggestions-strip";

function SidebarPanel({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white dark:border-zinc-700/80 dark:bg-zinc-900/60",
        className,
      )}
    >
      <div className="px-3.5 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          {Icon ? (
            <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
            {description ? (
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-3.5">{children}</div>
    </div>
  );
}

function SnapshotStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50/80 px-2.5 py-2 dark:bg-zinc-800/50">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white mt-0.5">
        {value}
      </p>
      {hint ? (
        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function PeriodSnapshotPanel({
  data,
  currency,
}: {
  data: OverviewSidebarData["snapshot"];
  currency: SupportedCurrency;
}) {
  return (
    <SidebarPanel
      title="Period snapshot"
      description="Key ratios for this period"
      icon={PieChart}
    >
      <div className="grid grid-cols-2 gap-2">
        <SnapshotStat
          label="Expense ratio"
          value={
            data.expenseRatio !== null ? `${data.expenseRatio}%` : "—"
          }
          hint="Expenses ÷ receipts"
        />
        <SnapshotStat
          label="Tithes share"
          value={data.tithesShare !== null ? `${data.tithesShare}%` : "—"}
          hint="Of total receipts"
        />
        <SnapshotStat
          label="Avg monthly net"
          value={formatCurrency(data.avgMonthlyNet, currency)}
          hint="Across active months"
        />
        <SnapshotStat
          label="Best month"
          value={
            data.bestMonth
              ? formatCurrency(data.bestMonth.net, currency)
              : "—"
          }
          hint={data.bestMonth?.label}
        />
      </div>
      {data.weakestMonth ? (
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
          Weakest:{" "}
          <span className="font-medium text-slate-700 dark:text-zinc-300">
            {data.weakestMonth.label}
          </span>{" "}
          ({formatCurrency(data.weakestMonth.net, currency)})
        </p>
      ) : null}
    </SidebarPanel>
  );
}

function TopExpensesPanel({
  rows,
  currency,
}: {
  rows: OverviewSidebarData["topExpenses"];
  currency: SupportedCurrency;
}) {
  return (
    <SidebarPanel
      title="Top expenses"
      description="Largest categories this period"
      icon={ArrowDownCircle}
    >
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
          No expenses recorded
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map(row => (
            <div key={row.category}>
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                  {row.category}
                </span>
                <span className="tabular-nums text-slate-600 dark:text-zinc-400 shrink-0">
                  {formatCurrency(row.amount, currency)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${row.percent}%`,
                    backgroundColor: row.fill,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {row.percent}% of spending
              </p>
            </div>
          ))}
        </div>
      )}
    </SidebarPanel>
  );
}

function formatActivityDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function RecentActivityPanel({
  rows,
  currency,
}: {
  rows: OverviewSidebarData["recentActivity"];
  currency: SupportedCurrency;
}) {
  return (
    <SidebarPanel
      title="Recent activity"
      description="Latest entries in this period"
      icon={History}
    >
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
          No entries yet
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
          {rows.map(row => (
            <div
              key={row.id}
              className={cn(
                "flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs",
                row.kind === "receipt"
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                  : "bg-rose-50/60 dark:bg-rose-950/20",
              )}
            >
              {row.kind === "receipt" ? (
                <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ArrowDownCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-slate-900 dark:text-white truncate">
                    {row.title}
                  </span>
                  <span
                    className={cn(
                      "tabular-nums font-medium shrink-0",
                      row.kind === "receipt"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400",
                    )}
                  >
                    {row.kind === "receipt" ? "+" : "−"}
                    {formatCurrency(row.amount, currency)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                  {formatActivityDate(row.date)} · {row.subtitle} ·{" "}
                  {row.paymentMethod}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SidebarPanel>
  );
}

function AuditsInPeriodPanel({
  rows,
  periodLabel,
  currency,
}: {
  rows: OverviewSidebarData["auditsInPeriod"];
  periodLabel: string;
  currency: SupportedCurrency;
}) {
  return (
    <SidebarPanel
      title={`Audits · ${periodLabel}`}
      description="Schedules with activity in this period"
      icon={ClipboardList}
    >
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
          No audits for this period
        </p>
      ) : (
        <div className="space-y-1.5">
          {rows.map(row => (
            <Link
              key={row.audit.id}
              href={`/financial/${row.audit.id}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200/60 px-2.5 py-2 hover:bg-slate-50 dark:border-zinc-700/60 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                  {row.audit.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {row.entryCount} entries · Net{" "}
                  <span
                    className={
                      row.net >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }
                  >
                    {formatCurrency(row.net, currency)}
                  </span>
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </SidebarPanel>
  );
}

interface OverviewSidebarProps {
  data: OverviewSidebarData;
  suggestions: FinancialSuggestion[];
  periodLabel: string;
  currency: SupportedCurrency;
}

export function OverviewSidebar({
  data,
  suggestions,
  periodLabel,
  currency,
}: OverviewSidebarProps) {
  return (
    <div className="space-y-4">
      <SuggestionsStrip suggestions={suggestions} layout="sidebar" />
      <PeriodSnapshotPanel data={data.snapshot} currency={currency} />
      <TopExpensesPanel rows={data.topExpenses} currency={currency} />
      <RecentActivityPanel rows={data.recentActivity} currency={currency} />
      <AuditsInPeriodPanel
        rows={data.auditsInPeriod}
        periodLabel={periodLabel}
        currency={currency}
      />
    </div>
  );
}
