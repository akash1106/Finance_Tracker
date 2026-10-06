"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  Briefcase,
  Layers,
  Calendar,
  Filter,
  X,
  Eye,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
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
import { useIncomeList, useIncomeSources } from "@/hooks/use-income";
import { useAccounts } from "@/hooks/use-accounts";
import { incomeApi } from "@/lib/api/income.api";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import type { IncomeTransaction } from "@/types/income";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { toast } from "sonner";

export default function IncomePage() {
  const [page, setPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [accountFilter, setAccountFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedIncome, setSelectedIncome] = useState<IncomeTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: sourcesData = [] } = useIncomeSources();
  const { data: accountsData = [] } = useAccounts();

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: 15,
    };
    if (sourceFilter !== "ALL") params.incomeSourceId = sourceFilter;
    if (accountFilter !== "ALL") params.accountId = accountFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [page, sourceFilter, accountFilter, startDate, endDate]);

  const { data, isLoading, isError } = useIncomeList(queryParams);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      toast.success("Income record removed");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove income record");
    },
  });

  const incomeItems = data?.items || [];
  const pagination = data?.pagination;

  const summary = useMemo(() => {
    let total = 0;
    let salary = 0;
    let other = 0;
    incomeItems.forEach((item) => {
      const amt = Number(item.amount) || 0;
      total += amt;
      if (item.incomeSource?.isSalary) {
        salary += amt;
      } else {
        other += amt;
      }
    });
    return { total, salary, other };
  }, [incomeItems]);

  const hasActiveFilters =
    sourceFilter !== "ALL" || accountFilter !== "ALL" || startDate || endDate;

  const handleResetFilters = () => {
    setSourceFilter("ALL");
    setAccountFilter("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeletingId(null);
    if (selectedIncome?.id === id) {
      setSelectedIncome(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Streams"
        description="Monitor inflow records, salary deposits, freelance revenue, and dividend gains"
      >
        <Link href="/income/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
        </Link>
      </PageHeader>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Inflow</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.total)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">In current page</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Salary Inflow</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.salary)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Primary fixed earnings</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Other Income</span>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.other)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Freelance, dividends, gifts</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Records</span>
            <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {pagination?.total ?? incomeItems.length}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">Income events logged</p>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            label="Income Source"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Sources" },
              ...sourcesData.map((s) => ({
                value: s.id,
                label: s.name + (s.isSalary ? " (Salary)" : ""),
              })),
            ]}
          />

          <Select
            label="Deposit Account"
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Accounts" },
              ...accountsData.map((a) => ({
                value: a.id,
                label: a.name,
              })),
            ]}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">From Date</label>
            <input
              type="date"
              aria-label="From date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">To Date</label>
            <input
              type="date"
              aria-label="To date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Main Income Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold">Income History</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load income data. Please verify your connection.
            </div>
          ) : incomeItems.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Briefcase}
                title="No income records"
                description={
                  hasActiveFilters
                    ? "No income records match the selected filters."
                    : "No income transactions recorded yet. Add your salary or income to start tracking."
                }
                action={
                  <Link href="/income/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Income
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
                    <TableHead>Received Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Deposit Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeItems.map((inc) => (
                    <TableRow key={inc.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(inc.receivedDate, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">
                        {inc.incomeSource?.name || "Income"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={inc.incomeSource?.isSalary ? "default" : "secondary"}
                          className="text-[11px]"
                        >
                          {inc.incomeSource?.isSalary ? "Salary" : "Non-Salary"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {inc.account?.name || "Default Account"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {inc.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        +{formatCurrency(inc.amount)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedIncome(inc)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeletingId(inc.id)}
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Income Details Dialog */}
      <Dialog
        open={Boolean(selectedIncome)}
        onOpenChange={(open) => !open && setSelectedIncome(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Income Receipt</DialogTitle>
            <DialogDescription>Audit details for incoming funds</DialogDescription>
          </DialogHeader>

          {selectedIncome && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">Credited Amount</span>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(selectedIncome.amount)}
                  </div>
                </div>
                <Badge variant={selectedIncome.incomeSource?.isSalary ? "default" : "secondary"}>
                  {selectedIncome.incomeSource?.isSalary ? "Salary" : "Other"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Source:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedIncome.incomeSource?.name || "Income"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {formatDate(selectedIncome.receivedDate, "dd MMMM yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deposit Account:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedIncome.account?.name || "Default Account"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Recurring:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedIncome.isRecurring ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {selectedIncome.description && (
                <div className="text-xs bg-muted/40 p-3 rounded-lg border border-border">
                  <span className="text-muted-foreground block mb-0.5">Description:</span>
                  <p className="text-foreground">{selectedIncome.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {selectedIncome && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedIncome.id)}
                isLoading={deleteMutation.isPending}
              >
                Delete Record
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Income Record?</DialogTitle>
            <DialogDescription>
              This will remove the transaction from your ledger and account balances.
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
