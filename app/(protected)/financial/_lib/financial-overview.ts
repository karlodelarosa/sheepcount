import type { SupportedCurrency } from "@/lib/currency";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import type { ExpenseLine, IncomeLine } from "./types";
import {
  enumerateMonthKeys,
  enumerateYearMonthKeys,
  type OverviewPeriodFilter,
} from "./overview-period";
import {
  computeGoalProgress,
  type FinancialGoalConfig,
  type GoalProgress,
} from "./goal-analysis";

export type { FinancialGoalConfig, GoalProgress, GoalReceiptScenario } from "./goal-analysis";

export type TrendDirection = "up" | "down" | "flat";

export type MonthlyTrendPoint = {
  month: string;
  monthKey: string;
  income: number;
  expenses: number;
  net: number;
};

export type IncomeBreakdownPoint = {
  name: string;
  value: number;
  fill: string;
};

export type FinancialSuggestion = {
  id: string;
  title: string;
  description: string;
  severity: "good" | "warning" | "action";
};

export type FinancialOverview = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalTithes: number;
  totalOfferings: number;
  totalDonations: number;
  monthlyTrend: MonthlyTrendPoint[];
  incomeBreakdown: IncomeBreakdownPoint[];
  trendDirection: TrendDirection;
  trendPercent: number;
  goalProgress: GoalProgress;
  suggestions: FinancialSuggestion[];
};

const INCOME_COLORS: Record<string, string> = {
  Tithes: "#3b82f6",
  Offering: "#10b981",
  Donation: "#8b5cf6",
};

function getMonthKey(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function fillMonthlyTrendForPeriod(
  trend: MonthlyTrendPoint[],
  period: OverviewPeriodFilter,
): MonthlyTrendPoint[] {
  if (period.mode === "year" && period.year) {
    const byKey = new Map(trend.map(point => [point.monthKey, point]));
    return enumerateYearMonthKeys(period.year).map(monthKey => {
      const existing = byKey.get(monthKey);
      return (
        existing ?? {
          month: formatMonthLabel(monthKey),
          monthKey,
          income: 0,
          expenses: 0,
          net: 0,
        }
      );
    });
  }

  if (period.mode === "single" && period.month) {
    const existing = trend.find(point => point.monthKey === period.month);
    return [
      existing ?? {
        month: formatMonthLabel(period.month),
        monthKey: period.month,
        income: 0,
        expenses: 0,
        net: 0,
      },
    ];
  }

  if (period.mode === "range" && period.fromMonth && period.toMonth) {
    const byKey = new Map(trend.map(point => [point.monthKey, point]));
    return enumerateMonthKeys(period.fromMonth, period.toMonth).map(monthKey => {
      const existing = byKey.get(monthKey);
      return (
        existing ?? {
          month: formatMonthLabel(monthKey),
          monthKey,
          income: 0,
          expenses: 0,
          net: 0,
        }
      );
    });
  }

  return trend;
}

export function buildMonthlyTrend(
  income: IncomeLine[],
  expenses: ExpenseLine[],
): MonthlyTrendPoint[] {
  const monthMap = new Map<
    string,
    { income: number; expenses: number }
  >();

  for (const line of income) {
    const key = getMonthKey(line.date);
    const existing = monthMap.get(key) ?? { income: 0, expenses: 0 };
    existing.income += line.amount;
    monthMap.set(key, existing);
  }

  for (const line of expenses) {
    const key = getMonthKey(line.date);
    const existing = monthMap.get(key) ?? { income: 0, expenses: 0 };
    existing.expenses += line.amount;
    monthMap.set(key, existing);
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, values]) => ({
      month: formatMonthLabel(monthKey),
      monthKey,
      income: values.income,
      expenses: values.expenses,
      net: values.income - values.expenses,
    }));
}

function computeTrend(
  income: IncomeLine[],
  expenses: ExpenseLine[],
): { direction: TrendDirection; percent: number } {
  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const netInRange = (start: Date, end: Date) => {
    let inc = 0;
    let exp = 0;
    for (const line of income) {
      const d = new Date(line.date);
      if (d >= start && d <= end) inc += line.amount;
    }
    for (const line of expenses) {
      const d = new Date(line.date);
      if (d >= start && d <= end) exp += line.amount;
    }
    return inc - exp;
  };

  const recentNet = netInRange(fourWeeksAgo, now);
  const priorNet = netInRange(eightWeeksAgo, fourWeeksAgo);

  if (priorNet === 0) {
    return {
      direction: recentNet > 0 ? "up" : recentNet < 0 ? "down" : "flat",
      percent: 0,
    };
  }

  const percent = Math.round(((recentNet - priorNet) / Math.abs(priorNet)) * 100);
  return {
    direction: percent > 2 ? "up" : percent < -2 ? "down" : "flat",
    percent: Math.abs(percent),
  };
}

function buildSuggestions(
  income: IncomeLine[],
  expenses: ExpenseLine[],
  trendDirection: TrendDirection,
  goalProgress: GoalProgress,
  currency: SupportedCurrency = DEFAULT_CURRENCY,
): FinancialSuggestion[] {
  const suggestions: FinancialSuggestion[] = [];

  const monthlyTrend = buildMonthlyTrend(income, expenses);
  const lastTwo = monthlyTrend.slice(-2);
  if (lastTwo.length === 2) {
    const expenseGrowth = lastTwo[1].expenses - lastTwo[0].expenses;
    const incomeGrowth = lastTwo[1].income - lastTwo[0].income;
    if (expenseGrowth > incomeGrowth && expenseGrowth > 0) {
      suggestions.push({
        id: "expense-review",
        title: "Review recurring expenses",
        description:
          "Expenses are rising faster than receipts. Audit utilities, maintenance, and ministry supply spending this month.",
        severity: "action",
      });
    }
  }

  if (
    goalProgress.isConfigured &&
    goalProgress.percent < 50 &&
    goalProgress.monthsAtCurrentPace !== null
  ) {
    suggestions.push({
      id: "goal-campaign",
      title: `Accelerate toward your ${formatCurrency(goalProgress.target, currency)} goal`,
      description: `At the current pace, reaching the target may take ${goalProgress.monthsAtCurrentPace} months. Consider a building fund or special offering drive.`,
      severity: "warning",
    });
  }

  const titheLines = income.filter(l => l.type === "Tithes");
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentTithes = titheLines
    .filter(l => new Date(l.date) >= threeMonthsAgo)
    .reduce((s, l) => s + l.amount, 0);
  const priorTithes = titheLines
    .filter(l => {
      const d = new Date(l.date);
      return d >= sixMonthsAgo && d < threeMonthsAgo;
    })
    .reduce((s, l) => s + l.amount, 0);

  if (priorTithes > 0 && recentTithes < priorTithes * 0.95) {
    suggestions.push({
      id: "tithes-communication",
      title: "Reinforce giving communication",
      description:
        "Tithes have dipped compared to prior months. Share impact stories and remind members about faithful giving.",
      severity: "warning",
    });
  }

  if (trendDirection === "up" && goalProgress.percent >= 30) {
    suggestions.push({
      id: "allocate-surplus",
      title: "Allocate surplus wisely",
      description:
        "Net giving is trending up. Consider setting aside a missions reserve or advancing a capital project milestone.",
      severity: "good",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "stay-consistent",
      title: "Stay consistent with weekly entries",
      description:
        "Keep recording tithes, offerings, and expenses each service date so trends stay accurate.",
      severity: "good",
    });
  }

  return suggestions.slice(0, 4);
}

export function computeFinancialOverview(
  income: IncomeLine[],
  expenses: ExpenseLine[],
  currency: SupportedCurrency = DEFAULT_CURRENCY,
  goal: FinancialGoalConfig = { targetAmount: null, targetDate: null },
): FinancialOverview {
  const totalIncome = income.reduce((sum, l) => sum + l.amount, 0);
  const totalExpenses = expenses.reduce((sum, l) => sum + l.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const totalTithes = income
    .filter(l => l.type === "Tithes")
    .reduce((sum, l) => sum + l.amount, 0);
  const totalOfferings = income
    .filter(l => l.type === "Offering")
    .reduce((sum, l) => sum + l.amount, 0);
  const totalDonations = income
    .filter(l => l.type === "Donation")
    .reduce((sum, l) => sum + l.amount, 0);

  const monthlyTrend = buildMonthlyTrend(income, expenses);

  const incomeBreakdown: IncomeBreakdownPoint[] = [
    { name: "Tithes", value: totalTithes, fill: INCOME_COLORS.Tithes },
    { name: "Offering", value: totalOfferings, fill: INCOME_COLORS.Offering },
    { name: "Donation", value: totalDonations, fill: INCOME_COLORS.Donation },
  ].filter(item => item.value > 0);

  const { direction: trendDirection, percent: trendPercent } = computeTrend(
    income,
    expenses,
  );
  const goalProgress = computeGoalProgress(netBalance, monthlyTrend, goal);
  const suggestions = buildSuggestions(
    income,
    expenses,
    trendDirection,
    goalProgress,
    currency,
  );

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    totalTithes,
    totalOfferings,
    totalDonations,
    monthlyTrend,
    incomeBreakdown,
    trendDirection,
    trendPercent,
    goalProgress,
    suggestions,
  };
}
