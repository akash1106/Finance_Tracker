"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  Plus,
  Coins,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  CreditCard,
  Percent,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Progress,
  Skeleton,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import {
  useLoans,
  useDeactivateLoan,
  useRecordLoanPayment,
} from "@/hooks/use-loans";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, toInputDate } from "@/lib/formatters/date";
import type { Loan } from "@/types/loan";

export default function LoansOverviewPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("REMAINING_DESC");

  const [paymentLoan, setPaymentLoan] = useState<Loan | null>(null);
  const [deactivatingLoan, setDeactivatingLoan] = useState<Loan | null>(null);

  // Payment Form States
  const [accountId, setAccountId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(toInputDate());
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const { data: loans, isLoading: isLoansLoading } = useLoans();
  const { data: accounts } = useAccounts();
  const deactivateMutation = useDeactivateLoan();
  const recordPaymentMutation = useRecordLoanPayment();

  const loanList = loans || [];
  const accountList = (accounts || []).filter((a) => a.isActive);

  // Compute aggregate debt metrics
  const debtMetrics = useMemo(() => {
    let totalPrincipal = 0;
    let totalOutstanding = 0;
    let totalMonthlyEmi = 0;
    let totalPaid = 0;
    let activeLoansCount = 0;
    let completedLoansCount = 0;

    loanList.forEach((loan) => {
      const principal = Number(loan.principalAmount ?? loan.principal ?? 0);
      const paid = Number(loan.paidAmount ?? 0);
      const remaining = Number(
        loan.remainingPrincipal ?? loan.remainingBalance ?? Math.max(0, principal - paid)
      );
      const emi = Number(loan.emiAmount ?? loan.monthlyEmi ?? 0);

      totalPrincipal += principal;
      totalPaid += paid;

      if (loan.status === "ACTIVE") {
        totalOutstanding += remaining;
        totalMonthlyEmi += emi;
        activeLoansCount++;
      } else if (loan.status === "COMPLETED") {
        completedLoansCount++;
      }
    });

    const payoffProgress =
      totalPrincipal > 0 ? Math.min(Math.round((totalPaid / totalPrincipal) * 100), 100) : 0;

    return {
      totalPrincipal,
      totalOutstanding,
      totalMonthlyEmi,
      totalPaid,
      activeLoansCount,
      completedLoansCount,
      payoffProgress,
    };
  }, [loanList]);

  // Filter and sort loans
  const filteredLoans = useMemo(() => {
    return loanList
      .filter((loan) => {
        if (statusFilter !== "ALL" && loan.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = loan.name.toLowerCase().includes(q);
          const matchDesc = loan.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const principalA = Number(a.principalAmount ?? a.principal ?? 0);
        const principalB = Number(b.principalAmount ?? b.principal ?? 0);
        const paidA = Number(a.paidAmount ?? 0);
        const paidB = Number(b.paidAmount ?? 0);
        const remA = Number(a.remainingPrincipal ?? a.remainingBalance ?? Math.max(0, principalA - paidA));
        const remB = Number(b.remainingPrincipal ?? b.remainingBalance ?? Math.max(0, principalB - paidB));
        const emiA = Number(a.emiAmount ?? a.monthlyEmi ?? 0);
        const emiB = Number(b.emiAmount ?? b.monthlyEmi ?? 0);

        if (sortBy === "REMAINING_DESC") return remB - remA;
        if (sortBy === "REMAINING_ASC") return remA - remB;
        if (sortBy === "EMI_DESC") return emiB - emiA;
        if (sortBy === "START_DATE_DESC") {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }
        return a.name.localeCompare(b.name);
      });
  }, [loanList, statusFilter, search, sortBy]);

  const handleOpenPayment = (loan: Loan) => {
    setPaymentLoan(loan);
    setAccountId(accountList[0]?.id || "");
    const emi = Number(loan.emiAmount ?? loan.monthlyEmi ?? 0);
    setPaymentAmount(emi > 0 ? String(emi) : "");
    setPaymentDate(toInputDate());
    setNotes(`Monthly EMI payment for ${loan.name}`);
    setFormError("");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLoan) return;

    const amt = parseFloat(paymentAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid payment amount greater than 0");
      return;
    }
    if (!accountId) {
      setFormError("Please select a source account");
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        loanId: paymentLoan.id,
        data: {
          accountId,
          amount: amt,
          paymentDate: paymentDate || toInputDate(),
          notes: notes.trim() || undefined,
        },
      });
      setPaymentLoan(null);
    } catch {
      // Handled via toast in hook
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingLoan) return;
    await deactivateMutation.mutateAsync(deactivatingLoan.id);
    setDeactivatingLoan(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans & EMI Repayments"
        description="Monitor liabilities, manage recurring EMI commitments, and track debt amortization progress"
      >
        <Link href="/loans/new">
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-4 w-4" /> Add Loan Liability
          </Button>
        </Link>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Outstanding Debt</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(debtMetrics.totalOutstanding)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {debtMetrics.activeLoansCount} active liabilities
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Monthly EMI Obligation</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(debtMetrics.totalMonthlyEmi)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scheduled monthly payout
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Principal Borrowed</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(debtMetrics.totalPrincipal)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Cumulative borrowed capital
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Debt Payoff Progress</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {debtMetrics.payoffProgress}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({formatCurrency(debtMetrics.totalPaid)} repaid)
              </span>
            </div>
            <div className="mt-2">
              <Progress value={debtMetrics.payoffProgress} variant="success" className="h-1.5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-2.5 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loans by title or description..."
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "COMPLETED", label: "Paid Off / Completed" },
            ]}
            className="h-9 text-xs w-44"
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: "REMAINING_DESC", label: "Highest Remaining" },
              { value: "REMAINING_ASC", label: "Lowest Remaining" },
              { value: "EMI_DESC", label: "Highest Monthly EMI" },
              { value: "START_DATE_DESC", label: "Recently Started" },
            ]}
            className="h-9 text-xs w-44"
          />
        </div>
      </Card>

      {/* Loans Grid */}
      {isLoansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredLoans.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={Landmark}
            title="No loan liabilities found"
            description={
              search || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or status filter."
                : "No active debts recorded. Add your home loan, car loan, laptop EMI, or personal loan to track repayment."
            }
            action={
              <Link href="/loans/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Add First Loan
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => {
            const principal = Number(loan.principalAmount ?? loan.principal ?? 0);
            const paid = Number(loan.paidAmount ?? 0);
            const remaining = Number(
              loan.remainingPrincipal ?? loan.remainingBalance ?? Math.max(0, principal - paid)
            );
            const emi = Number(loan.emiAmount ?? loan.monthlyEmi ?? 0);
            const interest = Number(loan.interestRate ?? 0);
            const pct = principal > 0 ? Math.min(Math.round((paid / principal) * 100), 100) : 0;
            const isCompleted = loan.status === "COMPLETED" || remaining <= 0;

            return (
              <Card
                key={loan.id}
                className="border-border hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden bg-card"
              >
                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Link
                        href={`/loans/${loan.id}`}
                        className="font-semibold text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {loan.name}
                      </Link>
                      {loan.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {loan.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No notes provided
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={isCompleted ? "default" : "outline"}
                      className={`text-[10px] shrink-0 font-medium ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                          : "border-primary/30 text-primary"
                      }`}
                    >
                      {isCompleted ? "PAID OFF" : loan.status}
                    </Badge>
                  </div>

                  {/* Amortization Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(paid)} paid
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {pct}%
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      variant={isCompleted ? "success" : "default"}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>Total Principal: {formatCurrency(principal)}</span>
                      <span>
                        {isCompleted
                          ? "Debt cleared!"
                          : `${formatCurrency(remaining)} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Terms Snapshot */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                        Monthly EMI
                      </span>
                      <span className="font-bold text-foreground">{formatCurrency(emi)}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                        Interest & Tenure
                      </span>
                      <span className="font-semibold text-foreground">
                        {interest > 0 ? `${interest}% p.a.` : "0% Interest"} ({loan.tenureMonths}m)
                      </span>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      Started: {formatDate(loan.startDate, "dd MMM yyyy")}
                    </span>
                    {loan.endDate && (
                      <span>Matures: {formatDate(loan.endDate, "dd MMM yyyy")}</span>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Link href={`/loans/${loan.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeactivatingLoan(loan)}
                      title="Archive loan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {loan.status === "ACTIVE" && !isCompleted && (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenPayment(loan)}
                    >
                      <Coins className="h-3.5 w-3.5" /> + Pay EMI
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Record Payment Dialog */}
      <Dialog
        open={Boolean(paymentLoan)}
        onOpenChange={(open) => {
          if (!open) setPaymentLoan(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              <span>Record EMI Payment for {paymentLoan?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Record an EMI installment. This will debit your selected bank account and reduce
              outstanding loan principal balance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {formError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Select
              label="Source Account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select source account
              </option>
              {accountList.map((acc) => {
                const bal =
                  Number(acc.currentBalance ?? acc.balance ?? acc.openingBalance) || 0;
                return (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountType}) — {formatCurrency(bal)}
                  </option>
                );
              })}
            </Select>

            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 5000"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />

            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="e.g. EMI installment via NetBanking"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                isLoading={recordPaymentMutation.isPending}
              >
                Confirm EMI Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={Boolean(deactivatingLoan)}
        onOpenChange={(open) => {
          if (!open) setDeactivatingLoan(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Loan?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive <strong>{deactivatingLoan?.name}</strong>? It will
              be removed from active liabilities. Historical payment transactions will remain
              preserved.
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
              Confirm Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
