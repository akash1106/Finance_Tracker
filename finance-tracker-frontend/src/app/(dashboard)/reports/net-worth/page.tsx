"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  Wallet,
  Coins,
  LineChart,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Printer,
  Scale,
  CreditCard,
  Building,
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
  Skeleton,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { useNetWorthReport } from "@/hooks/use-reports";
import { useAccounts } from "@/hooks/use-accounts";
import { useSavingsGoals } from "@/hooks/use-savings";
import { useInvestments } from "@/hooks/use-investments";
import { useLoans } from "@/hooks/use-loans";
import { formatCurrency } from "@/lib/formatters/currency";

export default function NetWorthReportPage() {
  const { data: netWorthReport, isLoading: isReportLoading } = useNetWorthReport();
  const { data: accountsData, isLoading: isAccountsLoading } = useAccounts();
  const { data: goalsData, isLoading: isGoalsLoading } = useSavingsGoals();
  const { data: investmentsData, isLoading: isInvestmentsLoading } = useInvestments();
  const { data: loansData, isLoading: isLoansLoading } = useLoans();

  const accounts = (accountsData || []).filter((a) => a.isActive);
  const goals = (goalsData || []).filter((g) => g.status === "ACTIVE");
  const investments = investmentsData || [];
  const loans = (loansData || []).filter((l) => l.status === "ACTIVE");

  // Granular asset & liability calculations
  const balanceSheet = useMemo(() => {
    // 1. Bank Accounts & Cash
    let bankCashTotal = 0;
    accounts.forEach((acc) => {
      const bal = Number(acc.currentBalance ?? acc.balance ?? acc.openingBalance) || 0;
      bankCashTotal += bal;
    });

    // 2. Savings Goals
    let savingsTotal = 0;
    goals.forEach((g) => {
      savingsTotal += Number(g.currentAmount) || 0;
    });

    // 3. Investments
    let investmentsTotal = 0;
    investments.forEach((inv) => {
      investmentsTotal += Number(inv.totalInvested ?? inv.totalContributed ?? 0);
    });

    const totalAssetsCalculated = bankCashTotal + savingsTotal + investmentsTotal;

    // Liabilities: Loans
    let loansTotal = 0;
    loans.forEach((l) => {
      const p = Number(l.principalAmount ?? l.principal ?? 0);
      const paid = Number(l.paidAmount ?? 0);
      const rem = Number(l.remainingPrincipal ?? l.remainingBalance ?? Math.max(0, p - paid));
      loansTotal += rem;
    });

    const finalAssets = totalAssetsCalculated > 0 ? totalAssetsCalculated : Number(netWorthReport?.assets ?? 0);
    const finalLiabilities = loansTotal > 0 ? loansTotal : Number(netWorthReport?.liabilities ?? 0);
    const calculatedNetWorth = finalAssets - finalLiabilities;

    const debtToAssetRatio =
      finalAssets > 0 ? Math.min(Math.round((finalLiabilities / finalAssets) * 100), 100) : 0;

    return {
      bankCashTotal,
      savingsTotal,
      investmentsTotal,
      finalAssets,
      loansTotal,
      finalLiabilities,
      calculatedNetWorth,
      debtToAssetRatio,
    };
  }, [accounts, goals, investments, loans, netWorthReport]);

  const isLoading =
    isReportLoading || isAccountsLoading || isGoalsLoading || isInvestmentsLoading || isLoansLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Net Worth Balance Sheet"
        description="Formal accounting statement of personal assets, liquid reserves, investments, and debt liabilities"
      >
        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Reports Center
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-xs"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
        </div>
      </PageHeader>

      {/* Top Solvency KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Net Worth Position</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(balanceSheet.calculatedNetWorth)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Assets minus total debts</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Assets</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(balanceSheet.finalAssets)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Liquid accounts, savings, funds</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Liabilities</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(balanceSheet.finalLiabilities)}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">Outstanding loan obligations</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Debt-to-Asset Ratio</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {balanceSheet.debtToAssetRatio}%
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {balanceSheet.debtToAssetRatio < 20 ? "Extremely solvent" : "Moderate leverage"}
            </p>
          </div>
        </Card>
      </div>

      {/* Two-Column Formal Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSETS LEDGER */}
        <Card className="border-border overflow-hidden bg-card">
          <CardHeader className="py-4 px-6 border-b border-border bg-emerald-500/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  ASSETS (What You Own)
                </CardTitle>
                <CardDescription className="text-xs">
                  Liquid reserves, goal funds, and investment assets
                </CardDescription>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(balanceSheet.finalAssets)}
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Item</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 1. Accounts */}
                {accounts.map((acc) => {
                  const bal = Number(acc.currentBalance ?? acc.balance ?? acc.openingBalance) || 0;
                  return (
                    <TableRow key={acc.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs text-foreground">
                        {acc.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                          {acc.accountType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {formatCurrency(bal)}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* 2. Savings Goals */}
                {goals.map((goal) => {
                  const amt = Number(goal.currentAmount) || 0;
                  return (
                    <TableRow key={goal.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs text-foreground">
                        {goal.name} (Goal)
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] py-0 px-1 text-blue-500 border-blue-500/30">
                          SAVINGS
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {formatCurrency(amt)}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* 3. Investments */}
                {investments.map((inv) => {
                  const amt = Number(inv.totalInvested ?? inv.totalContributed ?? 0);
                  return (
                    <TableRow key={inv.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs text-foreground">
                        {inv.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] py-0 px-1 text-purple-500 border-purple-500/30">
                          {inv.investmentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {formatCurrency(amt)}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Total Assets Row */}
                <TableRow className="bg-emerald-500/10 font-bold border-t-2 border-border">
                  <TableCell colSpan={2} className="text-xs font-bold text-foreground">
                    TOTAL ASSETS
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(balanceSheet.finalAssets)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* LIABILITIES LEDGER */}
        <Card className="border-border overflow-hidden bg-card flex flex-col justify-between">
          <div>
            <CardHeader className="py-4 px-6 border-b border-border bg-rose-500/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                    LIABILITIES (What You Owe)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Outstanding loans and obligations
                  </CardDescription>
                </div>
              </div>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(balanceSheet.finalLiabilities)}
              </span>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Liability Item</TableHead>
                    <TableHead>Tenure</TableHead>
                    <TableHead className="text-right">Outstanding Principal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                        <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        No active debt obligations! You are debt-free.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.map((loan) => {
                      const p = Number(loan.principalAmount ?? loan.principal ?? 0);
                      const paid = Number(loan.paidAmount ?? 0);
                      const rem = Number(
                        loan.remainingPrincipal ?? loan.remainingBalance ?? Math.max(0, p - paid)
                      );
                      return (
                        <TableRow key={loan.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-xs text-foreground">
                            {loan.name}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {loan.tenureMonths} Months
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                            {formatCurrency(rem)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}

                  {/* Total Liabilities Row */}
                  <TableRow className="bg-rose-500/10 font-bold border-t-2 border-border">
                    <TableCell colSpan={2} className="text-xs font-bold text-foreground">
                      TOTAL LIABILITIES
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(balanceSheet.finalLiabilities)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </div>

          {/* Net Worth Summary Footer Banner */}
          <div className="p-6 bg-muted/40 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Net Solvency Position
              </span>
              <span className="text-xl font-bold text-foreground">
                Net Worth = {formatCurrency(balanceSheet.calculatedNetWorth)}
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-xs py-1 px-3 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            >
              Solvent
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
