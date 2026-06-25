export type FinancialGoalConfig = {
  targetAmount: number | null;
  targetDate: string | null;
};

export type GoalReceiptScenario = {
  months: number;
  label: string;
  additionalMonthlyReceipts: number;
  receiptIncreasePercent: number | null;
};

export type GoalProgress = {
  current: number;
  target: number;
  percent: number;
  remaining: number;
  monthsAtCurrentPace: number | null;
  targetDate: string | null;
  daysUntilTarget: number | null;
  monthsUntilTarget: number | null;
  avgMonthlyNet: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  requiredMonthlyNet: number | null;
  additionalMonthlyReceipts: number | null;
  receiptIncreasePercent: number | null;
  onTrack: boolean | null;
  projectedReachDate: string | null;
  scenarios: GoalReceiptScenario[];
  isConfigured: boolean;
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysUntil(dateStr: string, from = new Date()): number {
  const target = startOfDay(new Date(dateStr));
  const today = startOfDay(from);
  const diff = target.getTime() - today.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / 86_400_000);
}

function monthsFromDays(days: number): number {
  if (days <= 0) return 0;
  return Math.max(days / 30.4375, 1 / 30.4375);
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addMonthsToDate(from: Date, months: number): string {
  const date = new Date(from);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function computeAverages(monthlyTrend: { income: number; expenses: number; net: number }[]) {
  const recentMonths = monthlyTrend.slice(-3);
  if (recentMonths.length === 0) {
    return { avgMonthlyNet: 0, avgMonthlyIncome: 0, avgMonthlyExpenses: 0 };
  }

  const totals = recentMonths.reduce(
    (acc, month) => ({
      income: acc.income + month.income,
      expenses: acc.expenses + month.expenses,
      net: acc.net + month.net,
    }),
    { income: 0, expenses: 0, net: 0 },
  );

  const count = recentMonths.length;
  return {
    avgMonthlyNet: totals.net / count,
    avgMonthlyIncome: totals.income / count,
    avgMonthlyExpenses: totals.expenses / count,
  };
}

function buildScenario(
  remaining: number,
  months: number,
  label: string,
  avgMonthlyNet: number,
  avgMonthlyIncome: number,
): GoalReceiptScenario {
  if (months <= 0 || remaining <= 0) {
    return {
      months,
      label,
      additionalMonthlyReceipts: 0,
      receiptIncreasePercent: null,
    };
  }

  const requiredMonthlyNet = remaining / months;
  const additionalMonthlyReceipts = Math.max(0, requiredMonthlyNet - avgMonthlyNet);
  const receiptIncreasePercent =
    avgMonthlyIncome > 0
      ? Math.round((additionalMonthlyReceipts / avgMonthlyIncome) * 100)
      : null;

  return {
    months,
    label,
    additionalMonthlyReceipts,
    receiptIncreasePercent,
  };
}

export function computeGoalProgress(
  netBalance: number,
  monthlyTrend: { income: number; expenses: number; net: number }[],
  goal: FinancialGoalConfig,
): GoalProgress {
  const isConfigured = goal.targetAmount !== null && goal.targetAmount > 0;
  const target = isConfigured ? goal.targetAmount! : 0;
  const current = Math.max(netBalance, 0);
  const remaining = isConfigured ? Math.max(target - current, 0) : 0;
  const percent = isConfigured && target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const { avgMonthlyNet, avgMonthlyIncome, avgMonthlyExpenses } =
    computeAverages(monthlyTrend);

  const monthsAtCurrentPace =
    isConfigured && avgMonthlyNet > 0 && remaining > 0
      ? Math.ceil(remaining / avgMonthlyNet)
      : null;

  const projectedReachDate =
    monthsAtCurrentPace !== null
      ? addMonthsToDate(new Date(), monthsAtCurrentPace)
      : null;

  const daysUntilTarget =
    goal.targetDate && isConfigured ? daysUntil(goal.targetDate) : null;
  const monthsUntilTarget =
    daysUntilTarget !== null ? monthsFromDays(daysUntilTarget) : null;

  const requiredMonthlyNet =
    isConfigured && monthsUntilTarget !== null && monthsUntilTarget > 0 && remaining > 0
      ? remaining / monthsUntilTarget
      : null;

  const additionalMonthlyReceipts =
    requiredMonthlyNet !== null
      ? Math.max(0, requiredMonthlyNet - avgMonthlyNet)
      : null;

  const receiptIncreasePercent =
    additionalMonthlyReceipts !== null && avgMonthlyIncome > 0
      ? Math.round((additionalMonthlyReceipts / avgMonthlyIncome) * 100)
      : null;

  const onTrack =
    requiredMonthlyNet !== null && avgMonthlyNet > 0
      ? avgMonthlyNet >= requiredMonthlyNet
      : requiredMonthlyNet === 0 && remaining === 0
        ? true
        : null;

  const scenarioMonths = new Set<number>();
  if (monthsUntilTarget !== null && monthsUntilTarget > 0) {
    scenarioMonths.add(Math.round(monthsUntilTarget * 10) / 10);
  }
  for (const preset of [3, 6, 12]) {
    scenarioMonths.add(preset);
  }

  const scenarios = Array.from(scenarioMonths)
    .filter(months => months > 0)
    .sort((a, b) => a - b)
    .map(months => {
      const label =
        goal.targetDate &&
        monthsUntilTarget !== null &&
        Math.abs(months - monthsUntilTarget) < 0.5
          ? `By ${formatDateLabel(goal.targetDate)}`
          : `In ${Math.round(months)} month${Math.round(months) === 1 ? "" : "s"}`;

      return buildScenario(
        remaining,
        months,
        label,
        avgMonthlyNet,
        avgMonthlyIncome,
      );
    });

  return {
    current,
    target,
    percent,
    remaining,
    monthsAtCurrentPace,
    targetDate: goal.targetDate,
    daysUntilTarget,
    monthsUntilTarget,
    avgMonthlyNet,
    avgMonthlyIncome,
    avgMonthlyExpenses,
    requiredMonthlyNet,
    additionalMonthlyReceipts,
    receiptIncreasePercent,
    onTrack,
    projectedReachDate,
    scenarios,
    isConfigured,
  };
}
