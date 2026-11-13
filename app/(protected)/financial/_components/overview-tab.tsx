"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Minus,
  ChartPie,
  BarChart3,
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
import { FinancialStatCard } from "./financial-stat-card";
import { formatCurrency, type SupportedCurrency } from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import type { FinancialGoalConfig } from "../_lib/goal-analysis";
import { computeGoalProgress } from "../_lib/goal-analysis";
import {
  computeFinancialOverview,
  fillMonthlyTrendForPeriod,
  buildMonthlyTrend,
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
import { TithesAverageCard } from "./tithes-average-card";
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
  const { settings } = useOrganizationSettings();
  const [period, setPeriod] = useState<OverviewPeriodFilter>(
    DEFAULT_OVERVIEW_PERIOD,
  );

  const goalConfig = useMemo<FinancialGoalConfig>(
    () => ({
      targetAmount: settings.financialSavingsGoal ?? null,
      targetDate: settings.financialGoalTargetDate ?? null,
    }),
    [settings.financialGoalTargetDate, settings.financialSavingsGoal],
  );

  const overview = useMemo(() => {
    const filteredIncome = filterLinesByOverviewPeriod(income, period);
    const filteredExpenses = filterLinesByOverviewPeriod(expenses, period);
    const base = computeFinancialOverview(
      filteredIncome,
      filteredExpenses,
      currency,
      goalConfig,
    );

    const allTimeNet =
      income.reduce((sum, line) => sum + line.amount, 0) -
      expenses.reduce((sum, line) => sum + line.amount, 0);
    const allTimeMonthlyTrend = buildMonthlyTrend(income, expenses);
    const goalProgress = computeGoalProgress(
      allTimeNet,
      allTimeMonthlyTrend,
      goalConfig,
    );

    return {
      ...base,
      monthlyTrend: fillMonthlyTrendForPeriod(base.monthlyTrend, period),
      goalProgress,
    };
  }, [income, expenses, currency, period, goalConfig]);

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
    <div className="space-y-5">
      <OverviewPeriodFilterBar
        value={period}
        onChange={setPeriod}
        income={income}
        expenses={expenses}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialStatCard
          label="Total Receipts"
          value={formatCurrency(overview.totalIncome, currency)}
          hint={periodHint}
          icon={ArrowUpCircle}
          tone="income"
        />
        <FinancialStatCard
          label="Total Expenses"
          value={formatCurrency(overview.totalExpenses, currency)}
          hint={periodHint}
          icon={ArrowDownCircle}
          tone="expense"
        />
        <FinancialStatCard
          label="Net Balance"
          value={formatCurrency(overview.netBalance, currency)}
          hint="Receipts minus expenses"
          icon={DollarSign}
          tone={overview.netBalance >= 0 ? "income" : "expense"}
        />
        <TithesAverageCard
          income={income}
          period={period}
          periodLabel={periodLabel}
          currency={currency}
        />
      </div>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 min-w-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FinancialStatCard
              label="Net Trend"
              value={trendLabel}
              hint="Last 4 weeks vs prior 4 weeks"
              tone={
                overview.trendDirection === "up"
                  ? "income"
                  : overview.trendDirection === "down"
                    ? "expense"
                    : "neutral"
              }
              icon={
                overview.trendDirection === "up"
                  ? TrendingUp
                  : overview.trendDirection === "down"
                    ? TrendingDown
                    : Minus
              }
            />
            <FinancialStatCard
              label="Offerings & Donations"
              value={formatCurrency(
                overview.totalOfferings + overview.totalDonations,
                currency,
              )}
              hint={`${formatCurrency(overview.totalOfferings, currency)} offerings · ${formatCurrency(overview.totalDonations, currency)} donations`}
              icon={DollarSign}
              tone="giving"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <ChartPanel
              title="Receipts vs Expenses"
              icon={TrendingUp}
              description={`${periodLabel} — monthly totals and net`}
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
                          formatCurrency(v as number, currency).replace(
                            /\.\d+$/,
                            "",
                          )
                        }
                      />
                      <Tooltip
                        content={<CurrencyTooltip currency={currency} />}
                      />
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
                        stroke="#3b82f6"
                        fill="#3b82f6"
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
              icon={ChartPie}
              description="Breakdown by giving type"
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
            icon={BarChart3}
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
                        formatCurrency(v as number, currency).replace(
                          /\.\d+$/,
                          "",
                        )
                      }
                    />
                    <Tooltip
                      content={<CurrencyTooltip currency={currency} />}
                    />
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
          <GoalProgressCard overview={overview} currency={currency} />
        </div>

        <aside className="min-w-0 2xl:sticky 2xl:top-4 2xl:self-start">
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
