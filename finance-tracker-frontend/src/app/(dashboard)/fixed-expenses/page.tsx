"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Building,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Skeleton,
  EmptyState,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import {
  useFixedExpenses,
  useDeactivateFixedExpense,
  useGenerateFixedExpense,
} from "@/hooks/use-fixed-expenses";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { FixedExpense } from "@/lib/api/fixed-expenses.api";

export default function FixedExpensesPage() {
  const [search, setSearch] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const { data: expenses, isLoading } = useFixedExpenses();
  const deactivateMutation = useDeactivateFixedExpense();
  const generateMutation = useGenerateFixedExpense();

  const expenseList = expenses || [];

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Computed metrics
  const stats = useMemo(() => {
    let monthlyTotal = 0;
    let upcomingCount = 0;
    let overdueCount = 0;

    expenseList.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      if (exp.frequency === "WEEKLY") monthlyTotal += amt * 4.33;
      else if (exp.frequency === "MONTHLY") monthlyTotal += amt;
      else if (exp.frequency === "YEARLY") monthlyTotal += amt / 12;

      const dueDate = new Date(exp.nextDueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) overdueCount++;
      else if (diffDays <= 7) upcomingCount++;
    });

    return {
      monthlyObligation: monthlyTotal,
      activeCount: expenseList.length,
      upcomingCount,
      overdueCount,
    };
  }, [expenseList, today]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenseList.filter((exp) => {
      if (frequencyFilter !== "ALL" && exp.frequency !== frequencyFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = exp.name.toLowerCase().includes(query);
        const matchesCategory = exp.category?.name?.toLowerCase().includes(query);
        const matchesAccount = exp.account?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesAccount) return false;
      }
      return true;
    });
  }, [expenseList, frequencyFilter, search]);

  const handleDeactivate = async () => {
    if (!deactivatingId) return;
    await deactivateMutation.mutateAsync(deactivatingId);
    setDeactivatingId(null);
  };

  const handleGenerate = async (id: string) => {
    setGeneratingId(id);
    try {
      await generateMutation.mutateAsync(id);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fixed Expenses"
        description="Track and automate mandatory recurring obligations (Rent, Utilities, Subscriptions, Insurance)"
      >
        <Link href="/fixed-expenses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Fixed Expense
          </Button>
        </Link>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Monthly Obligation</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.monthlyObligation)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Normalized monthly total</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Schedules</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{stats.activeCount}</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recurring commitments</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Due This Week</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.upcomingCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Due within 7 days</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overdue Attention</span>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                stats.overdueCount > 0
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {stats.overdueCount > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl font-bold ${
                stats.overdueCount > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {stats.overdueCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.overdueCount > 0 ? "Past due date!" : "All payments current"}
            </p>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-2.5 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by expense, category, or account..."
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Frequencies" },
              { value: "MONTHLY", label: "Monthly" },
              { value: "WEEKLY", label: "Weekly" },
              { value: "YEARLY", label: "Yearly" },
            ]}
            className="h-9 text-xs w-36"
          />
        </div>
      </Card>

      {/* Main Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Fixed Expense Schedule</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CalendarClock}
                title="No fixed expenses found"
                description={
                  search || frequencyFilter !== "ALL"
                    ? "Try adjusting your search keywords or frequency filter."
                    : "You haven't configured any fixed recurring expenses yet. Add your rent, bills, or subscriptions to automate tracking."
                }
                action={
                  <Link href="/fixed-expenses/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Fixed Expense
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Next Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((exp) => {
                    const dueDate = new Date(exp.nextDueDate);
                    const diffDays = Math.ceil(
                      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const isOverdue = diffDays < 0;
                    const isDueToday = diffDays === 0;
                    const isDueSoon = diffDays > 0 && diffDays <= 7;

                    return (
                      <TableRow key={exp.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">
                            {exp.name}
                          </div>
                          {exp.autoGenerate && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                              <RefreshCw className="h-2.5 w-2.5" /> Auto-advance
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {exp.frequency}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span>{exp.category?.name || "General"}</span>
                          {exp.subcategory?.name && (
                            <span className="text-[11px] text-muted-foreground/80">
                              {" "}
                              / {exp.subcategory.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {exp.account?.name || "Default Account"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground">
                              {formatDate(exp.nextDueDate, "dd MMM yyyy")}
                            </span>
                            {isOverdue ? (
                              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                                Overdue ({Math.abs(diffDays)}d)
                              </Badge>
                            ) : isDueToday ? (
                              <Badge className="text-[10px] py-0 px-1.5 bg-amber-500 text-white">
                                Due Today
                              </Badge>
                            ) : isDueSoon ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 text-amber-600 dark:text-amber-400 border-amber-400"
                              >
                                in {diffDays}d
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap font-bold text-sm text-rose-600 dark:text-rose-400">
                          {formatCurrency(exp.amount)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1 border-primary/30 hover:bg-primary/10 text-primary"
                              onClick={() => handleGenerate(exp.id)}
                              isLoading={generatingId === exp.id}
                              title="Generate debit transaction for this due date"
                            >
                              <Play className="h-3 w-3" /> Log Expense
                            </Button>
                            <Link href={`/fixed-expenses/${exp.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeactivatingId(exp.id)}
                              title="Deactivate Fixed Expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Modal */}
      <Dialog
        open={Boolean(deactivatingId)}
        onOpenChange={(open) => !open && setDeactivatingId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate Fixed Expense?</DialogTitle>
            <DialogDescription>
              This recurring expense will be removed from your active schedules. Existing recorded
              transactions will remain untouched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              isLoading={deactivateMutation.isPending}
            >
              Confirm Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
