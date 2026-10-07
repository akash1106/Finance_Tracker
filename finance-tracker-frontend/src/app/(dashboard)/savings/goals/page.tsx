"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Coins,
  ArrowLeft,
  Trash2,
  AlertCircle,
  PiggyBank,
  PauseCircle,
  Eye,
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
  Textarea,
} from "@/components/ui";
import {
  useSavingsGoals,
  useDeactivateSavingsGoal,
  useAddSavingsContribution,
} from "@/hooks/use-savings";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, toInputDate } from "@/lib/formatters/date";
import type { SavingsGoal } from "@/types/savings";

export default function SavingsGoalsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("CREATED_DESC");

  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [deactivatingGoal, setDeactivatingGoal] = useState<SavingsGoal | null>(null);

  // Contribute form state
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDate, setContributionDate] = useState(toInputDate());
  const [contributionNotes, setContributionNotes] = useState("");
  const [formError, setFormError] = useState("");

  const { data: goals, isLoading: goalsLoading } = useSavingsGoals();
  const { data: accounts } = useAccounts();
  const deactivateMutation = useDeactivateSavingsGoal();
  const addContributionMutation = useAddSavingsContribution();

  const goalList = goals || [];
  const accountList = (accounts || []).filter((a) => a.isActive);

  // Computed summary metrics
  const stats = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completedCount = 0;
    let activeCount = 0;

    goalList.forEach((g) => {
      const target = Number(g.targetAmount) || 0;
      const current = Number(g.currentAmount) || 0;
      if (g.status === "ACTIVE") {
        totalTarget += target;
        totalSaved += current;
        activeCount++;
      }
      if (g.status === "COMPLETED" || current >= target) {
        completedCount++;
      }
    });

    const totalRemaining = Math.max(0, totalTarget - totalSaved);
    const overallProgress =
      totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;

    return {
      totalTarget,
      totalSaved,
      totalRemaining,
      overallProgress,
      completedCount,
      activeCount,
    };
  }, [goalList]);

  // Filtered and sorted goals
  const filteredGoals = useMemo(() => {
    return goalList
      .filter((goal) => {
        if (statusFilter !== "ALL" && goal.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = goal.name.toLowerCase().includes(q);
          const matchDesc = goal.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const targetA = Number(a.targetAmount) || 0;
        const targetB = Number(b.targetAmount) || 0;
        const currentA = Number(a.currentAmount) || 0;
        const currentB = Number(b.currentAmount) || 0;
        const pctA = targetA > 0 ? currentA / targetA : 0;
        const pctB = targetB > 0 ? currentB / targetB : 0;

        if (sortBy === "TARGET_DESC") return targetB - targetA;
        if (sortBy === "TARGET_ASC") return targetA - targetB;
        if (sortBy === "PROGRESS_DESC") return pctB - pctA;
        if (sortBy === "PROGRESS_ASC") return pctA - pctB;
        if (sortBy === "DATE_ASC") {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [goalList, statusFilter, search, sortBy]);

  const handleOpenContribute = (goal: SavingsGoal) => {
    setContributeGoal(goal);
    setSelectedAccountId(accountList[0]?.id || "");
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
      // toast shown automatically in hook
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingGoal) return;
    await deactivateMutation.mutateAsync(deactivatingGoal.id);
    setDeactivatingGoal(null);
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Savings Goals"
        description="Establish milestones, track progress against target funds, and build disciplined savings"
      >
        <div className="flex items-center gap-2">
          <Link href="/savings">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Savings Hub
            </Button>
          </Link>
          <Link href="/savings/goals/new">
            <Button size="sm" className="gap-2 text-xs">
              <Plus className="h-4 w-4" /> Add Savings Goal
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Target Balance</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalTarget)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {stats.activeCount} active goals
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Saved to Date</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.totalSaved)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.overallProgress}% of target funded
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Remaining to Fund</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(stats.totalRemaining)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Outstanding gap</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed Milestones</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{stats.completedCount}</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Fully reached goals</p>
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
              placeholder="Search goals by title or description..."
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
              { value: "COMPLETED", label: "Completed" },
              { value: "PAUSED", label: "Paused" },
            ]}
            className="h-9 text-xs w-36"
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: "CREATED_DESC", label: "Newest First" },
              { value: "PROGRESS_DESC", label: "Highest % Done" },
              { value: "PROGRESS_ASC", label: "Lowest % Done" },
              { value: "TARGET_DESC", label: "Highest Target" },
              { value: "TARGET_ASC", label: "Lowest Target" },
              { value: "DATE_ASC", label: "Target Date Soonest" },
            ]}
            className="h-9 text-xs w-44"
          />
        </div>
      </Card>

      {/* Goals Cards Grid */}
      {goalsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={Target}
            title="No savings goals found"
            description={
              search || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or status filter."
                : "You have not set up any savings goals yet. Create a goal to begin tracking your emergency buffer or savings milestone."
            }
            action={
              <Link href="/savings/goals/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Create New Goal
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const target = Number(goal.targetAmount) || 0;
            const current = Number(goal.currentAmount) || 0;
            const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
            const remaining = Math.max(0, target - current);
            const isCompleted = goal.status === "COMPLETED" || current >= target;

            // Target date calculations
            let daysLeft: number | null = null;
            if (goal.targetDate) {
              const targetD = new Date(goal.targetDate);
              daysLeft = Math.ceil((targetD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            }

            return (
              <Card
                key={goal.id}
                className="border-border hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden bg-card"
              >
                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Link
                        href={`/savings/goals/${goal.id}`}
                        className="font-semibold text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {goal.name}
                      </Link>
                      {goal.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {goal.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No description provided
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        isCompleted
                          ? "default"
                          : goal.status === "PAUSED"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-[10px] py-0.5 px-2 shrink-0 font-medium"
                    >
                      {isCompleted ? "COMPLETED" : goal.status}
                    </Badge>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(current)}
                      </span>
                      <span className="font-bold text-primary">{pct}%</span>
                    </div>
                    <Progress
                      value={pct}
                      variant={isCompleted ? "success" : "default"}
                      className="h-2.5"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>Target: {formatCurrency(target)}</span>
                      <span>
                        {isCompleted
                          ? "Goal Achieved!"
                          : `${formatCurrency(remaining)} left`}
                      </span>
                    </div>
                  </div>

                  {/* Target Date Pill */}
                  {goal.targetDate && (
                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-muted/40 border border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(goal.targetDate, "dd MMM yyyy")}
                      </span>
                      {daysLeft !== null && (
                        <span
                          className={`font-medium ${
                            daysLeft < 0
                              ? "text-destructive"
                              : daysLeft <= 30
                              ? "text-amber-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)}d overdue`
                            : daysLeft === 0
                            ? "Due today"
                            : `${daysLeft} days left`}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Link href={`/savings/goals/${goal.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeactivatingGoal(goal)}
                      title="Archive goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {goal.status === "ACTIVE" && !isCompleted && (
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenContribute(goal)}
                    >
                      <Coins className="h-3.5 w-3.5" /> + Contribute
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Contribute Modal */}
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
              Record funds transferred into this goal. This will automatically deduct from your
              chosen account and log a saving transaction.
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
              label="Contribution Date"
              type="date"
              value={contributionDate}
              onChange={(e) => setContributionDate(e.target.value)}
              required
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="e.g. Monthly salary saving transfer"
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
                Record Contribution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive / Deactivate Confirmation Dialog */}
      <Dialog
        open={Boolean(deactivatingGoal)}
        onOpenChange={(open) => {
          if (!open) setDeactivatingGoal(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Savings Goal?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive <strong>{deactivatingGoal?.name}</strong>? It will
              be removed from your active goals. Historical financial transactions will remain
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
