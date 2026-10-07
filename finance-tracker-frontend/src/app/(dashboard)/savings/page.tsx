"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  PiggyBank,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Coins,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
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
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { useSavingsGoals, useAddSavingsContribution } from "@/hooks/use-savings";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, toInputDate } from "@/lib/formatters/date";
import type { SavingsGoal } from "@/types/savings";

export default function SavingsOverviewPage() {
  const { data: goals, isLoading: goalsLoading } = useSavingsGoals();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const addContributionMutation = useAddSavingsContribution();

  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDate, setContributionDate] = useState(toInputDate());
  const [contributionNotes, setContributionNotes] = useState("");
  const [formError, setFormError] = useState("");

  const goalList = goals || [];
  const accountList = accounts || [];

  // Liquid accounts (SAVINGS, CASH, CHECKING)
  const liquidAccounts = useMemo(() => {
    return accountList.filter(
      (acc) =>
        acc.isActive &&
        ["SAVINGS", "CASH", "CHECKING"].includes(acc.accountType?.toUpperCase() || "")
    );
  }, [accountList]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completedGoals = 0;
    let activeGoalsCount = 0;

    goalList.forEach((g) => {
      const target = Number(g.targetAmount) || 0;
      const current = Number(g.currentAmount) || 0;
      if (g.status === "ACTIVE") {
        totalTarget += target;
        totalSaved += current;
        activeGoalsCount++;
      }
      if (g.status === "COMPLETED" || current >= target) {
        completedGoals++;
      }
    });

    const liquidReserves = liquidAccounts.reduce((sum, acc) => {
      const bal = Number(acc.currentBalance ?? acc.balance ?? acc.openingBalance) || 0;
      return sum + bal;
    }, 0);

    const completionRate =
      totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;

    return {
      totalTarget,
      totalSaved,
      liquidReserves,
      completionRate,
      activeGoalsCount,
      completedGoals,
    };
  }, [goalList, liquidAccounts]);

  const handleOpenContribute = (goal: SavingsGoal) => {
    setContributeGoal(goal);
    setSelectedAccountId(liquidAccounts[0]?.id || accountList[0]?.id || "");
    setContributionAmount("");
    setContributionDate(toInputDate());
    setContributionNotes("");
    setFormError("");
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;

    const amt = parseFloat(contributionAmount);
    if (!amt || amt <= 0) {
      setFormError("Please enter a valid amount greater than 0");
      return;
    }
    if (!selectedAccountId) {
      setFormError("Please select a source account");
      return;
    }

    try {
      await addContributionMutation.mutateAsync({
        goalId: contributeGoal.id,
        data: {
          accountId: selectedAccountId,
          amount: amt,
          contributionDate: contributionDate || toInputDate(),
          notes: contributionNotes.trim() || undefined,
        },
      });
      setContributeGoal(null);
    } catch {
      // Error is notified via sonner toast in useAddSavingsContribution
    }
  };

  const isLoading = goalsLoading || accountsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Overview"
        description="Monitor your liquid reserves, track milestone savings, and build financial safety cushions"
      >
        <div className="flex items-center gap-2">
          <Link href="/savings/goals">
            <Button variant="outline" className="gap-2 text-xs">
              <Target className="h-4 w-4" /> View All Goals
            </Button>
          </Link>
          <Link href="/savings/goals/new">
            <Button className="gap-2 text-xs">
              <Plus className="h-4 w-4" /> New Savings Goal
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total In Goals</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.totalSaved)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {stats.activeGoalsCount} active goal{stats.activeGoalsCount === 1 ? "" : "s"}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Liquid Account Reserves</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.liquidReserves)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Savings & Cash accounts
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Goals Target</span>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalTarget)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formatCurrency(Math.max(0, stats.totalTarget - stats.totalSaved))} remaining
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overall Goal Progress</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{stats.completionRate}%</span>
              <span className="text-xs text-muted-foreground">
                ({stats.completedGoals} completed)
              </span>
            </div>
            <div className="mt-2">
              <Progress value={stats.completionRate} className="h-1.5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Goals Highlights (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Savings Goals</h2>
              <p className="text-xs text-muted-foreground">
                Progress towards safety nets and financial targets
              </p>
            </div>
            <Link
              href="/savings/goals"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Manage all goals <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : goalList.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={PiggyBank}
                title="No savings goals created yet"
                description="Start building financial resilience by establishing an Emergency Fund or target milestone."
                action={
                  <Link href="/savings/goals/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Create First Goal
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {goalList.slice(0, 4).map((goal) => {
                const target = Number(goal.targetAmount) || 0;
                const current = Number(goal.currentAmount) || 0;
                const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
                const remaining = Math.max(0, target - current);
                const isCompleted = goal.status === "COMPLETED" || current >= target;

                return (
                  <Card
                    key={goal.id}
                    className="p-4 border-border hover:border-primary/40 transition-all bg-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/savings/goals/${goal.id}`}
                            className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                          >
                            {goal.name}
                          </Link>
                          <Badge
                            variant={isCompleted ? "default" : "outline"}
                            className="text-[10px] py-0 px-1.5"
                          >
                            {isCompleted ? "COMPLETED" : goal.status}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {goal.status === "ACTIVE" && !isCompleted && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                            onClick={() => handleOpenContribute(goal)}
                          >
                            <Coins className="h-3.5 w-3.5" /> + Contribute
                          </Button>
                        )}
                        <Link href={`/savings/goals/${goal.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 text-xs">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar & Amount Summary */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(current)}{" "}
                          <span className="font-normal text-muted-foreground">
                            of {formatCurrency(target)}
                          </span>
                        </span>
                        <span className="font-semibold text-primary">{pct}%</span>
                      </div>
                      <Progress
                        value={pct}
                        variant={isCompleted ? "success" : "default"}
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                        <span>
                          {isCompleted ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Target reached!
                            </span>
                          ) : (
                            `${formatCurrency(remaining)} remaining`
                          )}
                        </span>
                        {goal.targetDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Target: {formatDate(goal.targetDate, "dd MMM yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Liquid Breakdown & Recommendations */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Liquid Reserves</h2>
            <p className="text-xs text-muted-foreground">
              Instant-access balances across your accounts
            </p>
          </div>

          <Card className="border-border p-4 bg-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">Account</span>
              <span className="text-xs font-medium text-muted-foreground">Available</span>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : liquidAccounts.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No active savings or cash accounts found.
                <div className="mt-2">
                  <Link href="/accounts/new">
                    <Button size="sm" variant="outline" className="text-xs">
                      + Add Account
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {liquidAccounts.map((acc) => {
                  const bal =
                    Number(acc.currentBalance ?? acc.balance ?? acc.openingBalance) || 0;
                  return (
                    <div key={acc.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-foreground font-medium text-[11px]">
                          {acc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{acc.name}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {acc.accountType}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">{formatCurrency(bal)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-foreground">
              <span>Total Available Liquid</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats.liquidReserves)}
              </span>
            </div>
          </Card>

          {/* Emergency Fund Guide Card */}
          <Card className="p-4 bg-muted/30 border-border space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Emergency Cushion Rule</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Financial planners recommend holding <strong>3 to 6 months</strong> of mandatory living
              expenses in high-liquidity accounts before deploying aggressive investments.
            </p>
            <div className="pt-2">
              <Link href="/savings/goals/new">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Setup Emergency Fund Goal
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Contribution Dialog Modal */}
      <Dialog
        open={Boolean(contributeGoal)}
        onOpenChange={(open) => {
          if (!open) setContributeGoal(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              <span>Contribute to {contributeGoal?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Record a transfer from your bank account to allocate money towards this savings goal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleContributeSubmit} className="space-y-4">
            {formError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Select
              label="Source Account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select source account
              </option>
              {accountList
                .filter((a) => a.isActive)
                .map((acc) => {
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
              label="Contribution Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 5000"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              required
            />

            <Input
              label="Date"
              type="date"
              value={contributionDate}
              onChange={(e) => setContributionDate(e.target.value)}
              required
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="e.g., Monthly salary saving transfer"
              value={contributionNotes}
              onChange={(e) => setContributionNotes(e.target.value)}
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
                isLoading={addContributionMutation.isPending}
              >
                Confirm Contribution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
