"use client";

import React, { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PiggyBank,
  Target,
  Clock,
  Plus,
  Coins,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet,
  Building,
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
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
  useSavingsGoal,
  useUpdateSavingsGoal,
  useDeactivateSavingsGoal,
  useAddSavingsContribution,
  useDeleteSavingsContribution,
} from "@/hooks/use-savings";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, toInputDate } from "@/lib/formatters/date";
import type { SavingsContribution, SavingsGoalStatus } from "@/types/savings";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SavingsGoalDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const goalId = resolvedParams.id;

  const { data: goal, isLoading: goalLoading } = useSavingsGoal(goalId);
  const { data: accounts } = useAccounts();

  const updateGoalMutation = useUpdateSavingsGoal();
  const deactivateGoalMutation = useDeactivateSavingsGoal();
  const addContributionMutation = useAddSavingsContribution();
  const deleteContributionMutation = useDeleteSavingsContribution();

  // Dialog states
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [deletingContribution, setDeletingContribution] = useState<SavingsContribution | null>(null);

  // Contribute form states
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [contributionDate, setContributionDate] = useState(toInputDate());
  const [notes, setNotes] = useState("");
  const [contributeError, setContributeError] = useState("");

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editStatus, setEditStatus] = useState<SavingsGoalStatus>("ACTIVE");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const accountList = (accounts || []).filter((a) => a.isActive);

  // Initialize edit form when goal loads
  const handleOpenEdit = () => {
    if (!goal) return;
    setEditName(goal.name);
    setEditTargetAmount(String(goal.targetAmount));
    setEditTargetDate(goal.targetDate ? toInputDate(goal.targetDate) : "");
    setEditStatus((goal.status as SavingsGoalStatus) || "ACTIVE");
    setEditDescription(goal.description || "");
    setEditError("");
    setIsEditOpen(true);
  };

  const handleOpenContribute = () => {
    setAccountId(accountList[0]?.id || "");
    setAmount("");
    setContributionDate(toInputDate());
    setNotes("");
    setContributeError("");
    setIsContributeOpen(true);
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContributeError("");

    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setContributeError("Please enter a valid amount greater than 0");
      return;
    }
    if (!accountId) {
      setContributeError("Please select a source account");
      return;
    }

    try {
      await addContributionMutation.mutateAsync({
        goalId,
        data: {
          accountId,
          amount: amt,
          contributionDate: contributionDate || toInputDate(),
          notes: notes.trim() || undefined,
        },
      });
      setIsContributeOpen(false);
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    if (!editName.trim()) {
      setEditError("Goal name is required");
      return;
    }
    const amt = parseFloat(editTargetAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setEditError("Target amount must be a positive number");
      return;
    }

    try {
      await updateGoalMutation.mutateAsync({
        id: goalId,
        data: {
          name: editName.trim(),
          targetAmount: amt,
          targetDate: editTargetDate || undefined,
          status: editStatus,
          description: editDescription.trim() || undefined,
        },
      });
      setIsEditOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError("Failed to update savings goal");
      }
    }
  };

  const handleDeleteContribution = async () => {
    if (!deletingContribution) return;
    try {
      await deleteContributionMutation.mutateAsync({
        goalId,
        contributionId: deletingContribution.id,
      });
      setDeletingContribution(null);
    } catch {
      // Handled in mutation hook
    }
  };

  const handleArchiveGoal = async () => {
    try {
      await deactivateGoalMutation.mutateAsync(goalId);
      setIsArchiveOpen(false);
      router.push("/savings/goals");
    } catch {
      // Handled in mutation hook
    }
  };

  if (goalLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Target}
          title="Savings Goal Not Found"
          description="The savings goal you are looking for does not exist or may have been deleted."
          action={
            <Link href="/savings/goals">
              <Button size="sm">Back to Savings Goals</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const targetAmountNum = Number(goal.targetAmount) || 0;
  const currentAmountNum = Number(goal.currentAmount) || 0;
  const remainingNum = Math.max(0, targetAmountNum - currentAmountNum);
  const progressPct =
    targetAmountNum > 0
      ? Math.min(Math.round((currentAmountNum / targetAmountNum) * 100), 100)
      : 0;
  const isCompleted = goal.status === "COMPLETED" || currentAmountNum >= targetAmountNum;

  // Days left calculation
  const today = new Date();
  let daysLeft: number | null = null;
  if (goal.targetDate) {
    const tDate = new Date(goal.targetDate);
    daysLeft = Math.ceil((tDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const contributions = goal.contributions || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={goal.name}
        description={goal.description || "Track contributions and target completion progress"}
      >
        <div className="flex items-center gap-2">
          <Link href="/savings/goals">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> All Goals
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={handleOpenEdit}
          >
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleOpenContribute}
          >
            <Plus className="h-4 w-4" /> Add Contribution
          </Button>
        </div>
      </PageHeader>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Current Saved</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(currentAmountNum)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {progressPct}% of target reached
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Target Amount</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(targetAmountNum)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total goal objective</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Remaining to Fund</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(remainingNum)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isCompleted ? "Goal completed!" : "Amount left to save"}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Goal Status & Timeline</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={isCompleted ? "default" : "secondary"}
                className="text-xs py-0.5"
              >
                {isCompleted ? "COMPLETED" : goal.status}
              </Badge>
              {daysLeft !== null && (
                <span
                  className={`text-xs font-medium ${
                    daysLeft < 0
                      ? "text-destructive"
                      : daysLeft <= 30
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {daysLeft < 0 ? "Past target" : `${daysLeft}d left`}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {goal.targetDate ? `Target: ${formatDate(goal.targetDate)}` : "No deadline set"}
            </p>
          </div>
        </Card>
      </div>

      {/* Progress Bar & Milestone Visualizer */}
      <Card className="p-6 border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Fund Completion Gauge</h3>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(currentAmountNum)} saved of {formatCurrency(targetAmountNum)} target
            </p>
          </div>
          <span className="text-xl font-bold text-primary font-mono">{progressPct}%</span>
        </div>

        <div className="space-y-2">
          <Progress
            value={progressPct}
            variant={isCompleted ? "success" : "default"}
            className="h-3"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
            <span>₹0 (0%)</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>{formatCurrency(targetAmountNum)} (100%)</span>
          </div>
        </div>

        {isCompleted && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Congratulations! You have fulfilled the target savings milestone for this goal.</span>
          </div>
        )}
      </Card>

      {/* Historical Contributions Ledger */}
      <Card className="border-border overflow-hidden bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Contributions History</CardTitle>
            <CardDescription className="text-xs">
              Every deposit recorded towards this savings milestone
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-8"
            onClick={handleOpenContribute}
          >
            <Plus className="h-3.5 w-3.5" /> Log Deposit
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {contributions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Coins}
                title="No contributions recorded yet"
                description="Make your first contribution to start progressing toward this savings goal."
                action={
                  <Button size="sm" className="gap-2" onClick={handleOpenContribute}>
                    <Plus className="h-4 w-4" /> Add First Contribution
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source Account</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution) => (
                    <TableRow key={contribution.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-xs font-medium whitespace-nowrap">
                        {formatDate(contribution.contributionDate, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {contribution.account?.name || "Account"}
                          </span>
                          {contribution.account?.accountType && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                              {contribution.account.accountType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {contribution.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        +{formatCurrency(contribution.amount)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingContribution(contribution)}
                          title="Delete contribution"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone / Archive */}
      <Card className="p-4 border-destructive/20 bg-destructive/5 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-destructive">Archive This Goal</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Archiving removes this goal from active savings view. Past financial transaction
            records will stay intact.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs shrink-0"
          onClick={() => setIsArchiveOpen(true)}
        >
          Archive Goal
        </Button>
      </Card>

      {/* Add Contribution Dialog */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              <span>Contribute to {goal.name}</span>
            </DialogTitle>
            <DialogDescription>
              Record a transfer from your bank account to allocate money toward this savings goal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleContributeSubmit} className="space-y-4">
            {contributeError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{contributeError}</span>
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
              label="Contribution Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
                isLoading={addContributionMutation.isPending}
              >
                Record Deposit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" /> Edit Savings Goal
            </DialogTitle>
            <DialogDescription>
              Update your savings target amount, timeline, or goal status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <Input
              label="Goal Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <Input
              label="Target Amount (₹)"
              type="number"
              step="0.01"
              min="1"
              value={editTargetAmount}
              onChange={(e) => setEditTargetAmount(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Target Date"
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
              />

              <Select
                label="Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as SavingsGoalStatus)}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "PAUSED", label: "Paused" },
                ]}
              />
            </div>

            <Textarea
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
            />

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" isLoading={updateGoalMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Contribution Confirmation */}
      <Dialog
        open={Boolean(deletingContribution)}
        onOpenChange={(open) => {
          if (!open) setDeletingContribution(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Contribution?</DialogTitle>
            <DialogDescription>
              This will remove this {formatCurrency(deletingContribution?.amount)} deposit from the
              savings goal and automatically revert the associated financial transaction.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteContribution}
              isLoading={deleteContributionMutation.isPending}
            >
              Delete & Revert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Goal Confirmation */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive {goal.name}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this goal? It will no longer appear in your active
              savings lists.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleArchiveGoal}
              isLoading={deactivateGoalMutation.isPending}
            >
              Confirm Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
