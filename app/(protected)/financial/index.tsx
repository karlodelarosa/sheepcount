"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, TrendingUp, Calendar, PieChart, TrendingDown, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { mockFinancialIncome, mockFinancialExpenses } from "@/components/mock-data";
import { AddFinancialRecordDialog } from "./_components/add-financial-record-dialog";
import { AddExpenseDialog } from "./_components/add-expenses-dialog";

export function FinancialView() {
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Calculate income totals
  const totalTithes = mockFinancialIncome
    .filter(r => r.type === "Tithes")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOfferings = mockFinancialIncome
    .filter(r => r.type === "Offering")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalDonations = mockFinancialIncome
    .filter(r => r.type === "Donation")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalIncome = totalTithes + totalOfferings + totalDonations;

  // Calculate expense totals
  const totalExpenses = mockFinancialExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Get recent records
  const sortedIncome = [...mockFinancialIncome]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sortedExpenses = [...mockFinancialExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Tithes":
        return "bg-blue-500";
      case "Offering":
        return "bg-green-500";
      case "Donation":
        return "bg-purple-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Income</CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">${totalIncome.toLocaleString()}</div>
            <p className="text-slate-600">All time</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Expenses</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">${totalExpenses.toLocaleString()}</div>
            <p className="text-slate-600">All time</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Net Balance</CardTitle>
            <DollarSign className={`h-5 w-5 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={netBalance >= 0 ? 'text-green-600' : 'text-red-600'}>${netBalance.toLocaleString()}</div>
            <p className="text-slate-600">Income - Expenses</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Tithes</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">${totalTithes.toLocaleString()}</div>
            <p className="text-slate-600">Weekly collections</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Offerings</CardTitle>
            <PieChart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">${totalOfferings.toLocaleString()}</div>
            <p className="text-slate-600">Special offerings</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Donations</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">${totalDonations.toLocaleString()}</div>
            <p className="text-slate-600">Special donations</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Records Table */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
          <CardDescription>Track income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="income" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="income" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsAddIncomeOpen(true)} className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income
                </Button>
              </div>
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedIncome.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          No income records yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedIncome.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-lg ${getTypeColor(record.type)}`}>
                              {record.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">{record.category}</TableCell>
                          <TableCell className="text-green-600">
                            +${record.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {record.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsAddExpenseOpen(true)} className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </div>
              <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          No expense records yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-lg">
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">{expense.description}</TableCell>
                          <TableCell className="text-slate-600">{expense.vendor}</TableCell>
                          <TableCell className="text-red-600">
                            -${expense.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddFinancialRecordDialog
        open={isAddIncomeOpen}
        onOpenChange={setIsAddIncomeOpen}
      />

      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
      />
    </div>
  );
}
