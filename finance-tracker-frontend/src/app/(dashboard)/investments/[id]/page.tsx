"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LineChart,
  Plus,
  Coins,
  Trash2,
  Edit,
  TrendingUp,
  Clock,
  Wallet,
  Calendar,
  AlertCircle,
  FileText,
  PieChart,
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
  useInvestment,
  useUpdateInvestment,
  useDeactivateInvestment,
  useAddInvestmentContribution,
  useDeleteInvestmentContribution,
} from "@/hooks/use-investments";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, toInputDate } from "@/lib/formatters/date";
import type {
  InvestmentContribution,
  InvestmentType,
} from "@/types/investment";
import { ASSET_TYPE_LABELS } from "../page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvestmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const investmentId = resolvedParams.id;

  const { data: investment, isLoading: investmentLoading } = useInvestment(investmentId);
  const { data: accounts } = useAccounts();

  const updateMutation = useUpdateInvestment();
  const deactivateMutation = useDeactivateInvestment();
  const addContributionMutation = useAddInvestmentContribution();
  const deleteContributionMutation = useDeleteInvestmentContribution();

  // Dialog states
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [deletingContribution, setDeletingContribution] = useState<InvestmentContribution | null>(null);

  // Contribute form states
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [contributionDate, setContributionDate] = useState(toInputDate());
  const [notes, setNotes] = useState("");
  const [contributeError, setContributeError] = useState("");

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<InvestmentType>("MUTUAL_FUND");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const accountList = (accounts || []).filter((a) => a.isActive);

  const handleOpenEdit = () => {
    if (!investment) return;
    setEditName(investment.name);
    const raw = investment.investmentType?.toUpperCase() || "OTHER";
    const norm = raw === "MUTUAL_FUNDS" ? "MUTUAL_FUND" : raw;
    setEditType(norm as InvestmentType);
    setEditDescription(investment.description || "");
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
        investmentId,
        data: {
          accountId,
          amount: amt,
          investmentDate: contributionDate || toInputDate(),
          notes: notes.trim() || undefined,
        },
      });
      setIsContributeOpen(false);
    } catch {
      // Handled via toast in hook
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    if (!editName.trim()) {
      setEditError("Investment asset name is required");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: investmentId,
        data: {
          name: editName.trim(),
          investmentType: editType,
          description: editDescription.trim() || undefined,
        },
      });
      setIsEditOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError("Failed to update investment asset");
      }
    }
  };

  const handleDeleteContribution = async () => {
    if (!deletingContribution) return;
    try {
      await deleteContributionMutation.mutateAsync({
        investmentId,
        contributionId: deletingContribution.id,
      });
      setDeletingContribution(null);
    } catch {
      // Handled via toast in hook
    }
  };

  const handleArchive = async () => {
    try {
      await deactivateMutation.mutateAsync(investmentId);
      setIsArchiveOpen(false);
      router.push("/investments");
    } catch {
      // Handled via toast in hook
    }
  };

  if (investmentLoading) {
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

  if (!investment) {
    return (
      <div className="p-8">
        <EmptyState
          icon={LineChart}
          title="Investment Holding Not Found"
          description="The investment holding you are looking for does not exist or may have been deleted."
          action={
            <Link href="/investments">
              <Button size="sm">Back to Portfolio</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const rawType = investment.investmentType?.toUpperCase() || "OTHER";
  const normType = rawType === "MUTUAL_FUNDS" ? "MUTUAL_FUND" : rawType;
  const meta = ASSET_TYPE_LABELS[normType] || { label: rawType, color: "bg-muted" };

  const contributions = investment.contributions || [];
  const totalInvestedNum = Number(investment.totalInvested ?? investment.totalContributed ?? 0);
  const contributionCount = contributions.length;
  const averageDeposit = contributionCount > 0 ? totalInvestedNum / contributionCount : 0;
  const latestDepositDate = contributions.length > 0 ? contributions[0].investmentDate : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={investment.name}
        description={investment.description || "Capital deployment history and contribution ledger"}
      >
        <div className="flex items-center gap-2">
          <Link href="/investments">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> All Holdings
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

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invested</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalInvestedNum)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative cost basis</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Asset Class</span>
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className={`text-xs py-0.5 ${meta.color}`}>
              {meta.label}
            </Badge>
            <p className="text-[11px] text-muted-foreground mt-1">Portfolio category</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Contributions</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{contributionCount}</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Avg {formatCurrency(averageDeposit)} per deposit
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Latest Investment</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-semibold text-foreground">
              {latestDepositDate ? formatDate(latestDepositDate) : "No deposits yet"}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Most recent transaction</p>
          </div>
        </Card>
      </div>

      {/* Asset Description Card */}
      {investment.description && (
        <Card className="p-4 bg-muted/20 border-border space-y-1">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" /> Holding Notes & Strategy
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {investment.description}
          </p>
        </Card>
      )}

      {/* Historical Contributions Table */}
      <Card className="border-border overflow-hidden bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Investment Contribution Ledger</CardTitle>
            <CardDescription className="text-xs">
              Every capital injection recorded towards this holding
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-8"
            onClick={handleOpenContribute}
          >
            <Plus className="h-3.5 w-3.5" /> Add Contribution
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {contributions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Coins}
                title="No investment contributions logged yet"
                description="Record your first investment purchase or SIP order to start tracking capital deployed."
                action={
                  <Button size="sm" className="gap-2" onClick={handleOpenContribute}>
                    <Plus className="h-4 w-4" /> Record First Contribution
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
                        {formatDate(contribution.investmentDate, "dd MMM yyyy")}
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

      {/* Danger Zone */}
      <Card className="p-4 border-destructive/20 bg-destructive/5 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-destructive">Archive This Investment</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Archiving removes this asset from active portfolio views. Historical financial transactions
            will stay preserved.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs shrink-0"
          onClick={() => setIsArchiveOpen(true)}
        >
          Archive Holding
        </Button>
      </Card>

      {/* Add Contribution Dialog */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              <span>Contribute to {investment.name}</span>
            </DialogTitle>
            <DialogDescription>
              Record funds invested into this asset. This will automatically deduct from your
              account and create an investment transaction.
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
              label="Investment Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <Input
              label="Investment Date"
              type="date"
              value={contributionDate}
              onChange={(e) => setContributionDate(e.target.value)}
              required
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="e.g. Monthly SIP execution via Groww"
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
                Record Investment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Investment Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" /> Edit Holding
            </DialogTitle>
            <DialogDescription>
              Update the holding scheme name, asset classification, or notes.
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
              label="Holding Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <Select
              label="Asset Class"
              value={editType}
              onChange={(e) => setEditType(e.target.value as InvestmentType)}
              options={[
                { value: "MUTUAL_FUND", label: "Mutual Funds" },
                { value: "STOCKS", label: "Stocks & Equities" },
                { value: "GOLD", label: "Gold & Sovereign Gold Bonds" },
                { value: "FD", label: "Fixed Deposit (FD)" },
                { value: "RD", label: "Recurring Deposit (RD)" },
                { value: "CRYPTO", label: "Cryptocurrency" },
                { value: "REAL_ESTATE", label: "Real Estate" },
                { value: "OTHER", label: "Other Asset" },
              ]}
              required
            />

            <Textarea
              label="Description / Notes"
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
              <Button type="submit" isLoading={updateMutation.isPending}>
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
              This will remove this {formatCurrency(deletingContribution?.amount)} investment deposit
              and revert the associated debit transaction from your account.
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

      {/* Archive Holding Confirmation */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive {investment.name}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this holding? It will no longer appear in your active
              portfolio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleArchive}
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
