"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Filter,
  Trash2,
  Eye,
  Calendar,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Skeleton,
  EmptyState,
  Pagination,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { Transaction } from "@/types/transaction";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [accountFilter, setAccountFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Transaction for detail modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: accountsData } = useAccounts();
  const { data: categoriesData } = useCategories();

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: 15,
    };
    if (search.trim()) params.search = search.trim();
    if (typeFilter !== "ALL") params.transactionType = typeFilter;
    if (accountFilter !== "ALL") params.accountId = accountFilter;
    if (categoryFilter !== "ALL") params.categoryId = categoryFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [page, search, typeFilter, accountFilter, categoryFilter, startDate, endDate]);

  const { data, isLoading, isError } = useTransactions(queryParams);
  const deleteMutation = useDeleteTransaction();

  const transactions = data?.items || [];
  const pagination = data?.pagination;

  // Calculate top quick summaries from current view
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.transactionType === "INCOME") income += amt;
      else if (tx.transactionType === "EXPENSE") expense += amt;
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setAccountFilter("ALL");
    setCategoryFilter("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    typeFilter !== "ALL" ||
    accountFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    startDate ||
    endDate;

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeletingId(null);
    if (selectedTransaction?.id === id) {
      setSelectedTransaction(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Monitor, audit, and categorize all monetary flows across your accounts"
      >
        <Link href="/transactions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Income</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.income)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">In current page</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Expenses</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.expense)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">In current page</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Net Cash Flow</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl font-bold ${
                summary.net >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {summary.net >= 0 ? "+" : ""}
              {formatCurrency(summary.net)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Income minus expenses</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Entries</span>
            <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {pagination?.total ?? transactions.length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Recorded transactions</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="p-4 border-border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Full-text search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by description or merchant..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Type filter */}
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Types" },
              { value: "EXPENSE", label: "Expense" },
              { value: "INCOME", label: "Income" },
              { value: "TRANSFER", label: "Transfer" },
            ]}
          />

          {/* Account filter */}
          <Select
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Accounts" },
              ...(accountsData?.map((acc) => ({
                value: acc.id,
                label: acc.name,
              })) || []),
            ]}
          />

          {/* Category filter */}
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Categories" },
              ...(categoriesData?.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })) || []),
            ]}
          />
        </div>

        {/* Date range filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Date Range:
            </span>
            <input
              type="date"
              aria-label="Start date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              aria-label="End date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Main Ledger Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Ledger Entries</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load transactions. Please check backend connection.
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ArrowLeftRight}
                title="No transactions found"
                description={
                  hasActiveFilters
                    ? "Try adjusting your filters or search keywords."
                    : "You haven't recorded any transactions yet. Record your first transaction to start tracking."
                }
                action={
                  <Link href="/transactions/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Transaction
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
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isExpense = tx.transactionType === "EXPENSE";
                    const isIncome = tx.transactionType === "INCOME";

                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap text-xs text-muted-foreground">
                          {formatDate(tx.transactionDate, "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-foreground text-sm">
                            {tx.description || "Untitled Transaction"}
                          </div>
                          {tx.notes && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {tx.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[11px] font-normal">
                              {tx.category?.name || "General"}
                            </Badge>
                            {tx.subcategory?.name && (
                              <span className="text-[11px] text-muted-foreground">
                                / {tx.subcategory.name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {tx.account?.name || "Default Account"}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground font-mono">
                            {tx.paymentMethod || "UPI"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap font-semibold">
                          <span
                            className={
                              isExpense
                                ? "text-rose-600 dark:text-rose-400"
                                : isIncome
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-foreground"
                            }
                          >
                            {isExpense ? "-" : isIncome ? "+" : ""}
                            {formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setSelectedTransaction(tx)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeletingId(tx.id)}
                              title="Delete Transaction"
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

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Transaction Details Modal Dialog */}
      <Dialog
        open={Boolean(selectedTransaction)}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Full audit information for this ledger entry</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 text-sm py-2">
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <div
                    className={`text-2xl font-bold ${
                      selectedTransaction.transactionType === "EXPENSE"
                        ? "text-rose-500"
                        : selectedTransaction.transactionType === "INCOME"
                        ? "text-emerald-500"
                        : "text-foreground"
                    }`}
                  >
                    {formatCurrency(selectedTransaction.amount)}
                  </div>
                </div>
                <Badge
                  variant={
                    selectedTransaction.transactionType === "EXPENSE"
                      ? "destructive"
                      : selectedTransaction.transactionType === "INCOME"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedTransaction.transactionType}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedTransaction.description || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {formatDate(selectedTransaction.transactionDate, "dd MMMM yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedTransaction.category?.name || "General"}
                    {selectedTransaction.subcategory?.name &&
                      ` (${selectedTransaction.subcategory.name})`}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedTransaction.account?.name || "Default Account"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedTransaction.paymentMethod || "UPI"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
                    {selectedTransaction.id}
                  </p>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Notes: </span>
                  {selectedTransaction.notes}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {selectedTransaction && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedTransaction.id)}
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The amount will be reverted from your accounts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              isLoading={deleteMutation.isPending}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
