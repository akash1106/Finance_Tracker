"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Repeat,
  Plus,
  Play,
  Trash2,
  Eye,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Layers,
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
  useRecurringTransactions,
  useDeactivateRecurringTransaction,
  useGenerateRecurringTransaction,
} from "@/hooks/use-recurring";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { RecurringTransaction } from "@/types/recurring";

const TYPE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  EXPENSE: { label: "Expense", variant: "destructive" },
  INCOME: { label: "Income", variant: "default" },
  TRANSFER: { label: "Transfer", variant: "secondary" },
  SAVING: { label: "Savings", variant: "secondary" },
  INVESTMENT: { label: "Investment", variant: "outline" },
  LOAN_PAYMENT: { label: "Loan EMI", variant: "outline" },
};

export default function RecurringPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const { data: rules, isLoading } = useRecurringTransactions();
  const deactivateMutation = useDeactivateRecurringTransaction();
  const generateMutation = useGenerateRecurringTransaction();

  const ruleList = rules || [];

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Computed metrics
  const stats = useMemo(() => {
    let monthlyOutflow = 0;
    let dueSoonCount = 0;

    ruleList.forEach((r) => {
      const amt = Number(r.amount) || 0;
      if (r.frequency === "WEEKLY") monthlyOutflow += amt * 4.33;
      else if (r.frequency === "MONTHLY") monthlyOutflow += amt;
      else if (r.frequency === "YEARLY") monthlyOutflow += amt / 12;

      const runDate = new Date(r.nextRunDate);
      const diffDays = Math.ceil((runDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) dueSoonCount++;
    });

    return {
      activeRules: ruleList.length,
      monthlyOutflow,
      dueSoonCount,
    };
  }, [ruleList, today]);

  // Filtered list
  const filteredRules = useMemo(() => {
    return ruleList.filter((r) => {
      if (typeFilter !== "ALL" && r.transactionType !== typeFilter) return false;
      if (frequencyFilter !== "ALL" && r.frequency !== frequencyFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesCategory = r.category?.name?.toLowerCase().includes(query);
        const matchesAccount = r.account?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesAccount) return false;
      }
      return true;
    });
  }, [ruleList, typeFilter, frequencyFilter, search]);

  const handleDeactivate = async () => {
    if (!deactivatingId) return;
    await deactivateMutation.mutateAsync(deactivatingId);
    setDeactivatingId(null);
  };

  const handleExecute = async (id: string) => {
    setExecutingId(id);
    try {
      await generateMutation.mutateAsync(id);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring Rules"
        description="Automate and schedule recurring monetary movements (SIPs, Investments, Recurring Bills, Scheduled Transfers)"
      >
        <Link href="/recurring/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Recurring Rule
          </Button>
        </Link>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Rules</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{stats.activeRules}</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recurring schedules configured</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Monthly Projected Flow</span>
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.monthlyOutflow)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Normalized monthly commitment</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Executing This Week</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.dueSoonCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Scheduled within 7 days</p>
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
              placeholder="Search by rule name, category, or account..."
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Types" },
              { value: "EXPENSE", label: "Expense" },
              { value: "INVESTMENT", label: "Investment" },
              { value: "SAVING", label: "Savings" },
              { value: "TRANSFER", label: "Transfer" },
              { value: "LOAN_PAYMENT", label: "Loan EMI" },
            ]}
            className="h-9 text-xs w-36"
          />

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
          <CardTitle className="text-sm font-semibold">Active Recurring Schedules</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Repeat}
                title="No recurring rules found"
                description={
                  search || typeFilter !== "ALL" || frequencyFilter !== "ALL"
                    ? "Try adjusting your search query or type filters."
                    : "You haven't set up any recurring rules yet. Automate your monthly SIPs, subscriptions, or transfers to save time."
                }
                action={
                  <Link href="/recurring/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Recurring Rule
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
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Category / Account</TableHead>
                    <TableHead>Next Run Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => {
                    const runDate = new Date(rule.nextRunDate);
                    const diffDays = Math.ceil(
                      (runDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const isDueToday = diffDays === 0;
                    const isPastDue = diffDays < 0;
                    const isDueSoon = diffDays > 0 && diffDays <= 7;
                    const typeConfig = TYPE_CONFIG[rule.transactionType] || {
                      label: rule.transactionType,
                      variant: "secondary" as const,
                    };

                    return (
                      <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">{rule.name}</div>
                          {rule.paymentMethod && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              via {rule.paymentMethod}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeConfig.variant} className="text-[10px]">
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {rule.frequency}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>
                            <span>{rule.category?.name || "General"}</span>
                            {rule.subcategory?.name && (
                              <span className="text-muted-foreground/80"> / {rule.subcategory.name}</span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {rule.account?.name || "Default Account"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-foreground">
                              {formatDate(rule.nextRunDate, "dd MMM yyyy")}
                            </span>
                            {isPastDue ? (
                              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                                Due ({Math.abs(diffDays)}d ago)
                              </Badge>
                            ) : isDueToday ? (
                              <Badge className="text-[10px] py-0 px-1.5 bg-amber-500 text-white">
                                Today
                              </Badge>
                            ) : isDueSoon ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 text-amber-500 border-amber-400"
                              >
                                in {diffDays}d
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap font-bold text-sm text-foreground">
                          {formatCurrency(rule.amount)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1 border-primary/30 hover:bg-primary/10 text-primary"
                              onClick={() => handleExecute(rule.id)}
                              isLoading={executingId === rule.id}
                              title="Execute recurring transaction now"
                            >
                              <Play className="h-3 w-3" /> Run Now
                            </Button>
                            <Link href={`/recurring/${rule.id}`}>
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
                              onClick={() => setDeactivatingId(rule.id)}
                              title="Deactivate Recurring Rule"
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
            <DialogTitle>Deactivate Recurring Rule?</DialogTitle>
            <DialogDescription>
              This schedule will stop executing automatically. Any previously generated transactions
              will remain in your ledger.
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
