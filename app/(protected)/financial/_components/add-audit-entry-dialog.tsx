"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCurrencySymbol,
  type SupportedCurrency,
} from "@/lib/currency";
import { todayDateString } from "../_lib/dates";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  type FinancialEntryType,
  type IncomeType,
  type PaymentMethod,
  type NewAuditExpenseEntry,
  type NewAuditIncomeEntry,
} from "../_lib/types";

interface AddAuditEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditId: string;
  currency: SupportedCurrency;
  onSubmitIncome: (entry: NewAuditIncomeEntry) => void;
  onSubmitExpense: (entry: NewAuditExpenseEntry) => void;
}

export function AddAuditEntryDialog({
  open,
  onOpenChange,
  auditId,
  currency,
  onSubmitIncome,
  onSubmitExpense,
}: AddAuditEntryDialogProps) {
  const [entryType, setEntryType] = useState<FinancialEntryType>("income");
  const today = todayDateString();
  const symbol = getCurrencySymbol(currency);

  const [incomeForm, setIncomeForm] = useState({
    date: today,
    type: "" as IncomeType | "",
    source: "",
    amount: "",
    paymentMethod: "Cash" as PaymentMethod,
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    date: today,
    category: "",
    amount: "",
    paymentMethod: "Cash" as PaymentMethod,
    description: "",
    vendor: "",
  });

  useEffect(() => {
    if (open) {
      const d = todayDateString();
      setIncomeForm(prev => ({ ...prev, date: d }));
      setExpenseForm(prev => ({ ...prev, date: d }));
    }
  }, [open]);

  const resetAndClose = () => {
    const d = todayDateString();
    setIncomeForm({
      date: d,
      type: "",
      source: "",
      amount: "",
      paymentMethod: "Cash",
      notes: "",
    });
    setExpenseForm({
      date: d,
      category: "",
      amount: "",
      paymentMethod: "Cash",
      description: "",
      vendor: "",
    });
    setEntryType("income");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (entryType === "income") {
      if (!incomeForm.type || !incomeForm.source.trim()) return;
      onSubmitIncome({
        auditId,
        date: incomeForm.date,
        type: incomeForm.type as IncomeType,
        source: incomeForm.source.trim(),
        amount: Number(incomeForm.amount),
        paymentMethod: incomeForm.paymentMethod,
        notes: incomeForm.notes,
      });
    } else {
      onSubmitExpense({
        auditId,
        date: expenseForm.date,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        paymentMethod: expenseForm.paymentMethod,
        description: expenseForm.description,
        vendor: expenseForm.vendor,
      });
    }

    resetAndClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) resetAndClose();
        else onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-[520px] border-slate-200/60">
        <DialogHeader>
          <DialogTitle>Add entry</DialogTitle>
          <DialogDescription>
            Record a receipt or an expense for this audit. Date defaults to today
            but can be changed for late inputs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs
            value={entryType}
            onValueChange={v => setEntryType(v as FinancialEntryType)}
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">Receipts</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
          </Tabs>

          {entryType === "income" ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audit-income-date">Date</Label>
                  <Input
                    id="audit-income-date"
                    type="date"
                    value={incomeForm.date}
                    onChange={e =>
                      setIncomeForm({ ...incomeForm, date: e.target.value })
                    }
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-income-type">Type</Label>
                  <Select
                    value={incomeForm.type}
                    onValueChange={value =>
                      setIncomeForm({
                        ...incomeForm,
                        type: value as IncomeType,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tithes">Tithes</SelectItem>
                      <SelectItem value="Offering">Offering</SelectItem>
                      <SelectItem value="Donation">Donation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-income-source">Source</Label>
                <Input
                  id="audit-income-source"
                  placeholder="e.g. Sunday morning service, Anonymous donor"
                  value={incomeForm.source}
                  onChange={e =>
                    setIncomeForm({ ...incomeForm, source: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audit-income-amount">Amount ({symbol})</Label>
                  <Input
                    id="audit-income-amount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={incomeForm.amount}
                    onChange={e =>
                      setIncomeForm({ ...incomeForm, amount: e.target.value })
                    }
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-income-payment">Received via</Label>
                  <Select
                    value={incomeForm.paymentMethod}
                    onValueChange={value =>
                      setIncomeForm({
                        ...incomeForm,
                        paymentMethod: value as PaymentMethod,
                      })
                    }
                  >
                    <SelectTrigger id="audit-income-payment" className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-income-notes">Notes (optional)</Label>
                <Textarea
                  id="audit-income-notes"
                  value={incomeForm.notes}
                  onChange={e =>
                    setIncomeForm({ ...incomeForm, notes: e.target.value })
                  }
                  className="rounded-lg"
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audit-expense-date">Date</Label>
                  <Input
                    id="audit-expense-date"
                    type="date"
                    value={expenseForm.date}
                    onChange={e =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    className="rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-expense-amount">Amount ({symbol})</Label>
                  <Input
                    id="audit-expense-amount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={expenseForm.amount}
                    onChange={e =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: e.target.value,
                      })
                    }
                    className="rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-expense-category">Category</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={value =>
                    setExpenseForm({ ...expenseForm, category: value })
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-expense-payment">Paid via</Label>
                <Select
                  value={expenseForm.paymentMethod}
                  onValueChange={value =>
                    setExpenseForm({
                      ...expenseForm,
                      paymentMethod: value as PaymentMethod,
                    })
                  }
                >
                  <SelectTrigger id="audit-expense-payment" className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-expense-vendor">Vendor / Payee</Label>
                <Input
                  id="audit-expense-vendor"
                  placeholder="Who was paid?"
                  value={expenseForm.vendor}
                  onChange={e =>
                    setExpenseForm({ ...expenseForm, vendor: e.target.value })
                  }
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-expense-description">Description</Label>
                <Textarea
                  id="audit-expense-description"
                  placeholder="What was this expense for?"
                  value={expenseForm.description}
                  onChange={e =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  className="rounded-lg"
                  rows={2}
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              Add entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
