"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCurrencySymbol,
  type SupportedCurrency,
} from "@/lib/currency";
import { useOrganizationSettings } from "@/lib/organization-settings";
import { parseFinancialAmount } from "../_lib/types";

interface SavingsGoalSectionProps {
  currency: SupportedCurrency;
}

export function SavingsGoalSection({ currency }: SavingsGoalSectionProps) {
  const { settings, isSaving, setFinancialGoal } = useOrganizationSettings();
  const symbol = getCurrencySymbol(currency);

  const [goalAmount, setGoalAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    setGoalAmount(
      settings.financialSavingsGoal
        ? String(settings.financialSavingsGoal)
        : "",
    );
    setTargetDate(settings.financialGoalTargetDate ?? "");
  }, [settings.financialGoalTargetDate, settings.financialSavingsGoal]);

  const handleSave = async () => {
    const amount = goalAmount.trim()
      ? parseFinancialAmount(goalAmount)
      : null;
    if (goalAmount.trim() && amount === null) return;

    await setFinancialGoal({
      targetAmount: amount,
      targetDate: targetDate.trim() || null,
    });
  };

  const handleClear = async () => {
    setGoalAmount("");
    setTargetDate("");
    await setFinancialGoal({ targetAmount: null, targetDate: null });
  };

  return (
    <Card className="border-slate-200/60 dark:border-zinc-700/60 lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-600" />
          <CardTitle className="text-base">Savings goal</CardTitle>
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Set how much you want to save and when you want to reach it. The
          overview analysis will show how much extra receipts you need each
          month.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="savings-goal-amount">Goal amount ({symbol})</Label>
            <Input
              id="savings-goal-amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 1000000"
              value={goalAmount}
              onChange={e => setGoalAmount(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savings-goal-date">Target date</Label>
            <Input
              id="savings-goal-date"
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-slate-900 hover:bg-slate-800"
          >
            Save goal
          </Button>
          {(settings.financialSavingsGoal || settings.financialGoalTargetDate) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isSaving}
              className="rounded-lg"
            >
              Clear goal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
