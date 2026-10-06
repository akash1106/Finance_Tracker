"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Landmark,
  Wallet,
  Coins,
  ArrowRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
import { useAccounts, useDeactivateAccount } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";

export default function AccountsPage() {
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const { data: accounts = [], isLoading, isError } = useAccounts();
  const deactivateMutation = useDeactivateAccount();

  // Aggregate totals
  const stats = useMemo(() => {
    let totalBalance = 0;
    let bankBalance = 0;
    let cashBalance = 0;
    let otherBalance = 0;

    accounts.forEach((acc) => {
      const balance = Number(acc.currentBalance ?? acc.balance ?? acc.openingBalance) || 0;
      totalBalance += balance;
      if (acc.accountType === "BANK") bankBalance += balance;
      else if (acc.accountType === "CASH") cashBalance += balance;
      else otherBalance += balance;
    });

    return { totalBalance, bankBalance, cashBalance, otherBalance };
  }, [accounts]);

  const handleDeactivate = async () => {
    if (!deactivatingId) return;
    await deactivateMutation.mutateAsync(deactivatingId);
    setDeactivatingId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Wallets"
        description="Monitor liquid balances across bank checking accounts, physical cash, and credit lines"
      >
        <Link href="/accounts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </Link>
      </PageHeader>

      {/* Top Aggregation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Total Liquid Net Worth</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalBalance)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across all {accounts.length} active accounts
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Bank Balances</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.bankBalance)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Checking & savings accounts</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Cash in Hand</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.cashBalance)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Physical liquid notes</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Other / Wallets</span>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.otherBalance)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Digital wallets and cards</p>
          </div>
        </Card>
      </div>

      {/* Account Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center border-destructive/20 text-destructive text-sm">
          Failed to load account details. Please verify your backend server connection.
        </Card>
      ) : accounts.length === 0 ? (
        <Card className="p-12 border-border text-center">
          <EmptyState
            icon={Landmark}
            title="No accounts registered"
            description="Add your first bank account or cash wallet to begin tracking your net worth and recording transactions."
            action={
              <Link href="/accounts/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Account
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const isBank = account.accountType === "BANK";
            const isCash = account.accountType === "CASH";
            const currentBal = Number(account.currentBalance ?? account.balance ?? account.openingBalance) || 0;

            return (
              <Card
                key={account.id}
                className="border-border hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          isBank
                            ? "bg-blue-500/10 text-blue-500"
                            : isCash
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {isBank ? (
                          <Landmark className="h-5 w-5" />
                        ) : isCash ? (
                          <Wallet className="h-5 w-5" />
                        ) : (
                          <Coins className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">{account.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {account.accountType}
                        </CardDescription>
                      </div>
                    </div>

                    <Badge variant={account.isActive ? "default" : "outline"} className="text-[10px]">
                      {account.isActive ? "Active" : "Archived"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="py-2">
                  <span className="text-xs text-muted-foreground block">Current Balance</span>
                  <div className="text-2xl font-extrabold text-foreground mt-0.5">
                    {formatCurrency(currentBal)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    <span>Opening: {formatCurrency(account.openingBalance)}</span>
                    <span className="font-mono text-[10px]">{account.id.slice(0, 8)}...</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                  <Link href={`/accounts/${account.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      View Ledger <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setDeactivatingId(account.id)}
                    title="Deactivate Account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Deactivate Account Confirmation Dialog */}
      <Dialog
        open={Boolean(deactivatingId)}
        onOpenChange={(open) => !open && setDeactivatingId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate Account?</DialogTitle>
            <DialogDescription>
              This account will be archived and will no longer appear in transaction entry
              dropdowns.
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
