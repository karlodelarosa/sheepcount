import type { MonthlyTrendPoint } from "./financial-overview";
import {
  filterLinesByOverviewPeriod,
  isDateInOverviewPeriod,
  type OverviewPeriodFilter,
} from "./overview-period";
import type {
  AuditExpenseEntry,
  AuditIncomeEntry,
  AuditSchedule,
  ExpenseLine,
} from "./types";

const EXPENSE_COLORS: Record<string, string> = {
  Electricity: "#f59e0b",
  Rent: "#ef4444",
  "Resources (Food, Water)": "#10b981",
  Salaries: "#6366f1",
  "Building Maintenance": "#8b5cf6",
  "Ministry Supplies": "#ec4899",
  "Missions Support": "#14b8a6",
  Insurance: "#64748b",
  Technology: "#0ea5e9",
  Other: "#94a3b8",
};

export type PeriodSnapshot = {
  expenseRatio: number | null;
  tithesShare: number | null;
  avgMonthlyNet: number;
  bestMonth: { label: string; net: number } | null;
  weakestMonth: { label: string; net: number } | null;
};

export type TopExpenseRow = {
  category: string;
  amount: number;
  percent: number;
  fill: string;
};

export type RecentActivityRow = {
  id: string;
  date: string;
  kind: "receipt" | "expense";
  title: string;
  subtitle: string;
  amount: number;
  paymentMethod: string;
};

export type AuditPeriodRow = {
  audit: AuditSchedule;
  receipts: number;
  expenses: number;
  net: number;
  entryCount: number;
};

export type OverviewSidebarData = {
  snapshot: PeriodSnapshot;
  topExpenses: TopExpenseRow[];
  recentActivity: RecentActivityRow[];
  auditsInPeriod: AuditPeriodRow[];
};

function computeSnapshot(
  totalIncome: number,
  totalExpenses: number,
  totalTithes: number,
  monthlyTrend: MonthlyTrendPoint[],
): PeriodSnapshot {
  const monthsWithData = monthlyTrend.filter(
    m => m.income > 0 || m.expenses > 0,
  );
  const avgMonthlyNet =
    monthsWithData.length > 0
      ? monthsWithData.reduce((sum, m) => sum + m.net, 0) / monthsWithData.length
      : 0;

  let bestMonth: PeriodSnapshot["bestMonth"] = null;
  let weakestMonth: PeriodSnapshot["weakestMonth"] = null;

  for (const month of monthsWithData) {
    if (!bestMonth || month.net > bestMonth.net) {
      bestMonth = { label: month.month, net: month.net };
    }
    if (!weakestMonth || month.net < weakestMonth.net) {
      weakestMonth = { label: month.month, net: month.net };
    }
  }

  return {
    expenseRatio:
      totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : null,
    tithesShare:
      totalIncome > 0 ? Math.round((totalTithes / totalIncome) * 100) : null,
    avgMonthlyNet,
    bestMonth,
    weakestMonth,
  };
}

function computeTopExpenses(
  expenses: ExpenseLine[],
  limit = 5,
): TopExpenseRow[] {
  const total = expenses.reduce((sum, line) => sum + line.amount, 0);
  if (total === 0) return [];

  const map = new Map<string, number>();
  for (const line of expenses) {
    map.set(line.category, (map.get(line.category) ?? 0) + line.amount);
  }

  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: Math.round((amount / total) * 100),
      fill: EXPENSE_COLORS[category] ?? "#94a3b8",
    }));
}

function computeRecentActivity(
  auditIncome: AuditIncomeEntry[],
  auditExpenses: AuditExpenseEntry[],
  period: OverviewPeriodFilter,
  limit = 8,
): RecentActivityRow[] {
  const income = filterLinesByOverviewPeriod(auditIncome, period);
  const expenses = filterLinesByOverviewPeriod(auditExpenses, period);

  const rows: RecentActivityRow[] = [
    ...income.map(line => ({
      id: line.id,
      date: line.date,
      kind: "receipt" as const,
      title: line.type,
      subtitle: line.source,
      amount: line.amount,
      paymentMethod: line.paymentMethod,
    })),
    ...expenses.map(line => ({
      id: line.id,
      date: line.date,
      kind: "expense" as const,
      title: line.category,
      subtitle: line.description || line.vendor,
      amount: line.amount,
      paymentMethod: line.paymentMethod,
    })),
  ];

  return rows
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

function computeAuditsInPeriod(
  audits: AuditSchedule[],
  auditIncome: AuditIncomeEntry[],
  auditExpenses: AuditExpenseEntry[],
  period: OverviewPeriodFilter,
): AuditPeriodRow[] {
  const rows: AuditPeriodRow[] = [];

  for (const audit of audits) {
    const income = filterLinesByOverviewPeriod(
      auditIncome.filter(line => line.auditId === audit.id),
      period,
    );
    const expenses = filterLinesByOverviewPeriod(
      auditExpenses.filter(line => line.auditId === audit.id),
      period,
    );

    const scheduleInPeriod = isDateInOverviewPeriod(audit.scheduleDate, period);
    const hasEntries = income.length > 0 || expenses.length > 0;

    if (!scheduleInPeriod && !hasEntries) continue;

    const receipts = income.reduce((sum, line) => sum + line.amount, 0);
    const expenseTotal = expenses.reduce((sum, line) => sum + line.amount, 0);

    rows.push({
      audit,
      receipts,
      expenses: expenseTotal,
      net: receipts - expenseTotal,
      entryCount: income.length + expenses.length,
    });
  }

  return rows.sort(
    (a, b) =>
      new Date(b.audit.scheduleDate).getTime() -
      new Date(a.audit.scheduleDate).getTime(),
  );
}

export function computeOverviewSidebarData(input: {
  expenses: ExpenseLine[];
  auditIncome: AuditIncomeEntry[];
  auditExpenses: AuditExpenseEntry[];
  audits: AuditSchedule[];
  period: OverviewPeriodFilter;
  totalIncome: number;
  totalExpenses: number;
  totalTithes: number;
  monthlyTrend: MonthlyTrendPoint[];
}): OverviewSidebarData {
  const filteredExpenses = filterLinesByOverviewPeriod(
    input.expenses,
    input.period,
  );

  return {
    snapshot: computeSnapshot(
      input.totalIncome,
      input.totalExpenses,
      input.totalTithes,
      input.monthlyTrend,
    ),
    topExpenses: computeTopExpenses(filteredExpenses),
    recentActivity: computeRecentActivity(
      input.auditIncome,
      input.auditExpenses,
      input.period,
    ),
    auditsInPeriod: computeAuditsInPeriod(
      input.audits,
      input.auditIncome,
      input.auditExpenses,
      input.period,
    ),
  };
}
