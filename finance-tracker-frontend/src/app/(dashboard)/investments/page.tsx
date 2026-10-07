"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LineChart,
  Plus,
  Coins,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Trash2,
  AlertCircle,
  Building2,
  PieChart,
  Shield,
  Sparkles,
  ArrowRight,
  Wallet,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import {
  useInvestments,
  useDeactivateInvestment,
  useAddInvestmentContribution,
} from "@/hooks/use-investments";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, toInputDate } from "@/lib/formatters/date";
import type { Investment } from "@/types/investment";

export const ASSET_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  MUTUAL_FUND: { label: "Mutual Funds", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  MUTUAL_FUNDS: { label: "Mutual Funds", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  STOCKS: { label: "Stocks", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  GOLD: { label: "Gold", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  FD: { label: "Fixed Deposit (FD)", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  RD: { label: "Recurring Deposit (RD)", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  CRYPTO: { label: "Crypto", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  REAL_ESTATE: { label: "Real Estate", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  OTHER: { label: "Other Asset", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};

export default function InvestmentsOverviewPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("TOTAL_DESC");

  const [contributeInvestment, setContributeInvestment] = useState<Investment | null>(null);
  const [deactivatingInvestment, setDeactivatingInvestment] = useState<Investment | null>(null);

  // Contribution Form State
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [contributionDate, setContributionDate] = useState(toInputDate());
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const { data: investments, isLoading: isInvestmentsLoading } = useInvestments();
  const { data: accounts } = useAccounts();
  const deactivateMutation = useDeactivateInvestment();
  const addContributionMutation = useAddInvestmentContribution();

  const investmentList = investments || [];
  const accountList = (accounts || []).filter((a) => a.isActive);

  // Compute portfolio metrics
  const portfolioMetrics = useMemo(() => {
    let totalInvested = 0;
    const typeDistribution: Record<string, number> = {};

    investmentList.forEach((inv) => {
      const amt = Number(inv.totalInvested ?? inv.totalContributed ?? 0);
      totalInvested += amt;

      const rawType = inv.investmentType?.toUpperCase() || "OTHER";
      const normalizedType = rawType === "MUTUAL_FUNDS" ? "MUTUAL_FUND" : rawType;
      typeDistribution[normalizedType] = (typeDistribution[normalizedType] || 0) + amt;
    });

    // Top asset class
    let topClass = "None";
    let topClassAmount = 0;
    Object.entries(typeDistribution).forEach(([t, amt]) => {
      if (amt > topClassAmount) {
        topClassAmount = amt;
        topClass = ASSET_TYPE_LABELS[t]?.label || t;
      }
    });

    const topClassPercent =
      totalInvested > 0 ? Math.round((topClassAmount / totalInvested) * 100) : 0;

    return {
      totalInvested,
      holdingsCount: investmentList.length,
      topClass,
      topClassPercent,
      typeDistribution,
    };
  }, [investmentList]);

  // Filter and sort holdings
  const filteredInvestments = useMemo(() => {
    return investmentList
      .filter((inv) => {
        if (typeFilter !== "ALL") {
          const raw = inv.investmentType?.toUpperCase();
          const norm = raw === "MUTUAL_FUNDS" ? "MUTUAL_FUND" : raw;
          if (norm !== typeFilter) return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = inv.name.toLowerCase().includes(q);
          const matchDesc = inv.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const amtA = Number(a.totalInvested ?? a.totalContributed ?? 0);
        const amtB = Number(b.totalInvested ?? b.totalContributed ?? 0);

        if (sortBy === "TOTAL_DESC") return amtB - amtA;
        if (sortBy === "TOTAL_ASC") return amtA - amtB;
        if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [investmentList, typeFilter, search, sortBy]);

  const handleOpenContribute = (inv: Investment) => {
    setContributeInvestment(inv);
    setAccountId(accountList[0]?.id || "");
    setAmount("");
    setContributionDate(toInputDate());
    setNotes("");
    setFormError("");
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeInvestment) return;

    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid contribution amount greater than 0");
      return;
    }
    if (!accountId) {
      setFormError("Please select a source account");
      return;
    }

    try {
      await addContributionMutation.mutateAsync({
        investmentId: contributeInvestment.id,
        data: {
          accountId,
          amount: amt,
          investmentDate: contributionDate || toInputDate(),
          notes: notes.trim() || undefined,
        },
      });
      setContributeInvestment(null);
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingInvestment) return;
    await deactivateMutation.mutateAsync(deactivatingInvestment.id);
    setDeactivatingInvestment(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investments Portfolio"
        description="Track capital deployed into mutual funds, stocks, gold, fixed deposits, and wealth assets"
      >
        <Link href="/investments/new">
          <Button size="sm" className="gap-2 text-xs">
            <Plus className="h-4 w-4" /> Add Investment Asset
          </Button>
        </Link>
      </PageHeader>

      {/* Top Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invested Capital</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(portfolioMetrics.totalInvested)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Accumulated principal contributions
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Holdings</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <LineChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {portfolioMetrics.holdingsCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Distinct investment holdings
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Primary Asset Class</span>
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {portfolioMetrics.topClass}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {portfolioMetrics.topClassPercent}% of total portfolio
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tracking Scope</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-semibold text-foreground">Cost-Basis Ledger</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              V1 tracks cash invested into assets
            </p>
          </div>
        </Card>
      </div>

      {/* Asset Class Distribution Bar */}
      {portfolioMetrics.totalInvested > 0 && (
        <Card className="p-4 bg-card border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-primary" /> Asset Allocation Breakdown
            </h3>
            <span className="text-xs font-bold text-foreground">
              {formatCurrency(portfolioMetrics.totalInvested)}
            </span>
          </div>

          {/* Multi-segment allocation meter */}
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden flex">
            {Object.entries(portfolioMetrics.typeDistribution).map(([typeKey, amount]) => {
              const pct = (amount / portfolioMetrics.totalInvested) * 100;
              if (pct <= 0) return null;

              let barColor = "bg-primary";
              if (typeKey === "MUTUAL_FUND") barColor = "bg-indigo-500";
              else if (typeKey === "STOCKS") barColor = "bg-emerald-500";
              else if (typeKey === "GOLD") barColor = "bg-amber-500";
              else if (typeKey === "FD") barColor = "bg-blue-500";
              else if (typeKey === "RD") barColor = "bg-cyan-500";
              else if (typeKey === "CRYPTO") barColor = "bg-purple-500";
              else if (typeKey === "REAL_ESTATE") barColor = "bg-rose-500";

              return (
                <div
                  key={typeKey}
                  style={{ width: `${pct}%` }}
                  className={`${barColor} transition-all duration-300`}
                  title={`${ASSET_TYPE_LABELS[typeKey]?.label || typeKey}: ${formatCurrency(amount)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Allocation Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {Object.entries(portfolioMetrics.typeDistribution).map(([typeKey, amount]) => {
              const pct = ((amount / portfolioMetrics.totalInvested) * 100).toFixed(1);
              const meta = ASSET_TYPE_LABELS[typeKey] || { label: typeKey, color: "bg-muted" };
              return (
                <div
                  key={typeKey}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border text-xs"
                >
                  <span className="font-medium text-foreground">{meta.label}</span>
                  <span className="font-bold text-foreground">{formatCurrency(amount)}</span>
                  <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-3 bg-card border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-64">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-2.5 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search investments by asset name or notes..."
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Asset Classes" },
              { value: "MUTUAL_FUND", label: "Mutual Funds" },
              { value: "STOCKS", label: "Stocks" },
              { value: "GOLD", label: "Gold" },
              { value: "FD", label: "Fixed Deposit" },
              { value: "RD", label: "Recurring Deposit" },
              { value: "CRYPTO", label: "Crypto" },
              { value: "REAL_ESTATE", label: "Real Estate" },
              { value: "OTHER", label: "Other" },
            ]}
            className="h-9 text-xs w-44"
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: "TOTAL_DESC", label: "Highest Invested" },
              { value: "TOTAL_ASC", label: "Lowest Invested" },
              { value: "NAME_ASC", label: "Name (A-Z)" },
              { value: "CREATED_DESC", label: "Recently Added" },
            ]}
            className="h-9 text-xs w-40"
          />
        </div>
      </Card>

      {/* Holdings Cards Grid */}
      {isInvestmentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredInvestments.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={LineChart}
            title="No investment assets found"
            description={
              search || typeFilter !== "ALL"
                ? "Try adjusting your search criteria or asset type filter."
                : "Start tracking your mutual funds, gold, fixed deposits, or equities to monitor your wealth contributions."
            }
            action={
              <Link href="/investments/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Add First Investment
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvestments.map((inv) => {
            const rawType = inv.investmentType?.toUpperCase() || "OTHER";
            const normType = rawType === "MUTUAL_FUNDS" ? "MUTUAL_FUND" : rawType;
            const meta = ASSET_TYPE_LABELS[normType] || { label: rawType, color: "bg-muted" };
            const total = Number(inv.totalInvested ?? inv.totalContributed ?? 0);

            return (
              <Card
                key={inv.id}
                className="border-border hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden bg-card"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Link
                        href={`/investments/${inv.id}`}
                        className="font-semibold text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {inv.name}
                      </Link>
                      {inv.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {inv.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No notes provided
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 font-medium ${meta.color}`}>
                      {meta.label}
                    </Badge>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Total Capital Invested
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Link href={`/investments/${inv.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeactivatingInvestment(inv)}
                      title="Archive investment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleOpenContribute(inv)}
                  >
                    <Coins className="h-3.5 w-3.5" /> + Contribute
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Contribution Dialog Modal */}
      <Dialog
        open={Boolean(contributeInvestment)}
        onOpenChange={(open) => {
          if (!open) setContributeInvestment(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              <span>Contribute to {contributeInvestment?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Record a capital investment. This will debit your selected bank account and log an
              investment transaction.
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
              placeholder="e.g., Monthly SIP order via Coin / Demat"
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

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={Boolean(deactivatingInvestment)}
        onOpenChange={(open) => {
          if (!open) setDeactivatingInvestment(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Investment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive <strong>{deactivatingInvestment?.name}</strong>? It
              will be removed from your active portfolio. Past financial transactions will remain
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
