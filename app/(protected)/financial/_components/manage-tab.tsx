"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type SupportedCurrency,
} from "@/lib/currency";
import { useFinancialAudits } from "../financial-context";

import { SavingsGoalSection } from "./savings-goal-section";

function OptionListSection({
  title,
  description,
  items,
  newValue,
  onNewValueChange,
  onAdd,
  onRemove,
  isSaving,
  placeholder,
}: {
  title: string;
  description: string;
  items: { id: string; name: string }[];
  newValue: string;
  onNewValueChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  isSaving: boolean;
  placeholder: string;
}) {
  return (
    <Card className="border-slate-200/60 dark:border-zinc-700/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-slate-500 dark:text-zinc-400">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newValue}
            onChange={e => onNewValueChange(e.target.value)}
            placeholder={placeholder}
            className="rounded-lg"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
          />
          <Button
            type="button"
            onClick={onAdd}
            disabled={isSaving || !newValue.trim()}
            className="rounded-lg shrink-0 bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No items yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/60 px-3 py-2 dark:border-zinc-700/60"
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.name}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-500 hover:text-rose-600"
                  disabled={isSaving}
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ManageTab({ currency }: { currency: SupportedCurrency }) {
  const {
    activeReceiptTypes,
    activeExpenseCategories,
    addReceiptType,
    removeReceiptType,
    addExpenseCategory,
    removeExpenseCategory,
    isSaving,
  } = useFinancialAudits();

  const [newReceiptType, setNewReceiptType] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("");

  const handleAddReceiptType = async () => {
    const success = await addReceiptType(newReceiptType);
    if (success) setNewReceiptType("");
  };

  const handleAddExpenseCategory = async () => {
    const success = await addExpenseCategory(newExpenseCategory);
    if (success) setNewExpenseCategory("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SavingsGoalSection currency={currency} />
      <OptionListSection
        title="Receipt types"
        description="Types shown when recording tithes, offerings, donations, and other receipts."
        items={activeReceiptTypes}
        newValue={newReceiptType}
        onNewValueChange={setNewReceiptType}
        onAdd={handleAddReceiptType}
        onRemove={removeReceiptType}
        isSaving={isSaving}
        placeholder="e.g. Special Offering"
      />
      <OptionListSection
        title="Expense categories"
        description="Categories shown when recording bills, salaries, supplies, and other expenses."
        items={activeExpenseCategories}
        newValue={newExpenseCategory}
        onNewValueChange={setNewExpenseCategory}
        onAdd={handleAddExpenseCategory}
        onRemove={removeExpenseCategory}
        isSaving={isSaving}
        placeholder="e.g. Water Meter"
      />
    </div>
  );
}
