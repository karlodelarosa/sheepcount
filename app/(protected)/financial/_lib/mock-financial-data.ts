import {
  mockFinancialExpenses,
  mockFinancialIncome,
} from "@/components/mock-data";
import type {
  ExpenseLine,
  FinancialDayGroup,
  IncomeLine,
} from "./types";

export function createInitialFinancialData(): {
  income: IncomeLine[];
  expenses: ExpenseLine[];
} {
  return {
    income: mockFinancialIncome.map(item => ({ ...item, type: item.type as IncomeLine["type"] })),
    expenses: mockFinancialExpenses.map(item => ({ ...item })),
  };
}

export function groupFinancialByDate(
  income: IncomeLine[],
  expenses: ExpenseLine[],
): FinancialDayGroup[] {
  const dateMap = new Map<string, FinancialDayGroup>();

  for (const line of income) {
    const existing = dateMap.get(line.date) ?? {
      date: line.date,
      income: [],
      expenses: [],
    };
    existing.income.push(line);
    dateMap.set(line.date, existing);
  }

  for (const line of expenses) {
    const existing = dateMap.get(line.date) ?? {
      date: line.date,
      income: [],
      expenses: [],
    };
    existing.expenses.push(line);
    dateMap.set(line.date, existing);
  }

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getDayNet(group: FinancialDayGroup): number {
  const incomeTotal = group.income.reduce((sum, line) => sum + line.amount, 0);
  const expenseTotal = group.expenses.reduce(
    (sum, line) => sum + line.amount,
    0,
  );
  return incomeTotal - expenseTotal;
}

export function computeDayTrends(
  groups: FinancialDayGroup[],
): Map<string, { direction: "up" | "down" | "flat"; percent: number }> {
  const sorted = [...groups].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const trends = new Map<
    string,
    { direction: "up" | "down" | "flat"; percent: number }
  >();

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentNet = getDayNet(current);

    if (i === 0) {
      trends.set(current.date, { direction: "flat", percent: 0 });
      continue;
    }

    const previous = sorted[i - 1];
    const previousNet = getDayNet(previous);

    if (previousNet === 0) {
      trends.set(current.date, {
        direction: currentNet > 0 ? "up" : currentNet < 0 ? "down" : "flat",
        percent: 0,
      });
      continue;
    }

    const percent = Math.round(
      ((currentNet - previousNet) / Math.abs(previousNet)) * 100,
    );
    trends.set(current.date, {
      direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
      percent: Math.abs(percent),
    });
  }

  return trends;
}
