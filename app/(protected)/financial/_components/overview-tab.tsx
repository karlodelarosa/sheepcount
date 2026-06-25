"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { OverviewStatCard } from "@/components/overview-stat-card";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import {
  computeFinancialOverview,
  fillMonthlyTrendForPeriod,
  type FinancialOverview,
} from "../_lib/financial-overview";
import {
  DEFAULT_OVERVIEW_PERIOD,
  filterLinesByOverviewPeriod,
  formatOverviewPeriodLabel,
  type OverviewPeriodFilter,
} from "../_lib/overview-period";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
  ExpenseLine,
  IncomeLine,
} from "../_lib/types";
import { computeOverviewSidebarData } from "../_lib/overview-sidebar";
import { ChartPanel, ChartEmpty } from "./chart-panel";
import { GoalProgressCard } from "./goal-progress-card";
import { OverviewPeriodFilterBar } from "./overview-period-filter";
import { OverviewSidebar } from "./overview-sidebar";

interface OverviewTabProps {
  income: IncomeLine[];
  expenses: ExpenseLine[];
  audits: AuditSchedule[];
  auditIncome: AuditIncomeEntry[];
  auditExpenses: AuditExpenseEntry[];
  currency: SupportedCurrency;
}

function TrendIcon({
  direction,
}: {
  direction: FinancialOverview["trendDirection"];
}) {
  if (direction === "up") {
    return <TrendingUp className="w-5 h-5 text-emerald-600" />;
  }
  if (direction === "down") {
    return <TrendingDown className="w-5 h-5 text-rose-600" />;
  }
  return <Minus className="w-5 h-5 text-slate-400" />;
}

function formatChartLabel(name?: string): string {
  if (name === "income") return "Receipts";
  return name ?? "";
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
          <span style={{ color: entry.color }}>
            {formatChartLabel(entry.name)}:{" "}
          </span>
          {formatCurrency(entry.value ?? 0, currency)}
        </p>
      ))}
    </div>
  );
}

export function OverviewTab({
  income,
  expenses,
  audits,
  auditIncome,
  auditExpenses,
  currency,
}: OverviewTabProps) {
  const [period, setPeriod] = useState<OverviewPeriodFilter>(
    DEFAULT_OVERVIEW_PERIOD,
  );

  const overview = useMemo(() => {
    const filteredIncome = filterLinesByOverviewPeriod(income, period);
    const filteredExpenses = filterLinesByOverviewPeriod(expenses, period);
    const base = computeFinancialOverview(
      filteredIncome,
      filteredExpenses,
      currency,
    );

    return {
      ...base,
      monthlyTrend: fillMonthlyTrendForPeriod(base.monthlyTrend, period),
    };
  }, [income, expenses, currency, period]);

  const sidebarData = useMemo(
    () =>
      computeOverviewSidebarData({
        expenses,
        auditIncome,
        auditExpenses,
        audits,
        period,
        totalIncome: overview.totalIncome,
        totalExpenses: overview.totalExpenses,
        totalTithes: overview.totalTithes,
        monthlyTrend: overview.monthlyTrend,
      }),
    [
      expenses,
      auditIncome,
      auditExpenses,
      audits,
      period,
      overview.totalIncome,
      overview.totalExpenses,
      overview.totalTithes,
      overview.monthlyTrend,
    ],
  );

  const periodLabel = formatOverviewPeriodLabel(period);
  const periodHint = `For ${periodLabel}`;

  const trendLabel =
    overview.trendDirection === "up"
      ? `Up ${overview.trendPercent}%`
      : overview.trendDirection === "down"
        ? `Down ${overview.trendPercent}%`
        : "Stable";

  return (
    <div className="space-y-4">
      <OverviewPeriodFilterBar
        value={period}
        onChange={setPeriod}
        income={income}
        expenses={expenses}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 min-w-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewStatCard
              label="Total Receipts"
              value={formatCurrency(overview.totalIncome, currency)}
              hint={periodHint}
              icon={ArrowUpCircle}
              variant="emerald"
            />
            <OverviewStatCard
              label="Total Expenses"
              value={formatCurrency(overview.totalExpenses, currency)}
              hint={periodHint}
              icon={ArrowDownCircle}
              variant="rose"
            />
            <OverviewStatCard
              label="Net Balance"
              value={formatCurrency(overview.netBalance, currency)}
              hint="Receipts minus expenses"
              icon={DollarSign}
              variant={overview.netBalance >= 0 ? "emerald" : "rose"}
            />
            <OverviewStatCard
              label="Tithes"
              value={formatCurrency(overview.totalTithes, currency)}
              hint="Weekly collections"
              icon={TrendingUp}
              variant="blue"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50/90 to-white p-4 dark:from-zinc-900/60 dark:to-zinc-900/30 dark:border-zinc-700/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Net Trend
                  </p>
                  <p className="text-2xl font-bold tabular-nums mt-1 text-slate-900 dark:text-white">
                    {trendLabel}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Last 4 weeks vs prior 4 weeks
                  </p>
                </div>
                <TrendIcon direction={overview.trendDirection} />
              </div>
            </div>
            <OverviewStatCard
              label="Offerings & Donations"
              value={formatCurrency(
                overview.totalOfferings + overview.totalDonations,
                currency,
              )}
              hint={`${formatCurrency(overview.totalOfferings, currency)} offerings · ${formatCurrency(overview.totalDonations, currency)} donations`}
              icon={DollarSign}
              variant="violet"
            />
          </div>

          <GoalProgressCard overview={overview} currency={currency} />

          <div className="grid gap-4 lg:grid-cols-5">
            <ChartPanel
              title="Receipts vs Expenses"
              description={`${periodLabel} — monthly totals and net`}
              className="lg:col-span-3"
            >
              {overview.monthlyTrend.length === 0 ? (
                <ChartEmpty message="No financial records for this period." />
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={overview.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={v =>
                          formatCurrency(v as number, currency).replace(/\.\d+$/, "")
                        }
                      />
                      <Tooltip content={<CurrencyTooltip currency={currency} />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="income"
                        name="Receipts"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#f43f5e"
                        fill="#f43f5e"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="net"
                        name="Net"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.08}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartPanel>

            <ChartPanel
              title="Receipts Mix"
              description="Breakdown by giving type"
              className="lg:col-span-2"
            >
              {overview.incomeBreakdown.length === 0 ? (
                <ChartEmpty message="No receipts recorded yet." />
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview.incomeBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {overview.incomeBreakdown.map(entry => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) =>
                          formatCurrency(value, currency)
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartPanel>
          </div>

          <ChartPanel
            title="Monthly Net"
            description={`Net giving for ${periodLabel}`}
          >
            {overview.monthlyTrend.length === 0 ? (
              <ChartEmpty message="No monthly data for this period." />
            ) : (
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={v =>
                        formatCurrency(v as number, currency).replace(/\.\d+$/, "")
                      }
                    />
                    <Tooltip content={<CurrencyTooltip currency={currency} />} />
                    <Bar dataKey="net" name="Net" radius={[4, 4, 0, 0]}>
                      {overview.monthlyTrend.map(entry => (
                        <Cell
                          key={entry.monthKey}
                          fill={entry.net >= 0 ? "#10b981" : "#f43f5e"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartPanel>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <OverviewSidebar
            data={sidebarData}
            suggestions={overview.suggestions}
            periodLabel={periodLabel}
            currency={currency}
          />
        </aside>
      </div>
    </div>
  );
}
