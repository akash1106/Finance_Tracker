"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Calendar, CreditCard, Tag, Building, FileText } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import { useTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [isDeleting, setIsDeleting] = useState(false);

  const { data: transaction, isLoading, isError } = useTransaction(id);
  const deleteMutation = useDeleteTransaction();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    router.push("/transactions");
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Transaction Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested transaction may have been removed or does not exist.
        </p>
        <Link href="/transactions">
          <Button variant="outline">Back to Transactions</Button>
        </Link>
      </div>
    );
  }

  const isExpense = transaction.transactionType === "EXPENSE";
  const isIncome = transaction.transactionType === "INCOME";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to transactions
        </Link>
        <Button
          variant="destructive"
          size="sm"
          className="gap-1.5"
          onClick={() => setIsDeleting(true)}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      <PageHeader
        title={transaction.description || "Transaction"}
        description={`Audit record ID: ${transaction.id}`}
      />

      {/* Main Receipt Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ledger Voucher
            </span>
            <Badge
              variant={
                isExpense ? "destructive" : isIncome ? "default" : "secondary"
              }
            >
              {transaction.transactionType}
            </Badge>
          </div>
          <div className="mt-2">
            <span
              className={`text-3xl font-extrabold ${
                isExpense
                  ? "text-rose-500"
                  : isIncome
                  ? "text-emerald-500"
                  : "text-foreground"
              }`}
            >
              {isExpense ? "-" : isIncome ? "+" : ""}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border pt-2">
          <div className="py-3 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Transaction Date</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(transaction.transactionDate, "dd MMMM yyyy")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Payment Method</span>
                <span className="text-sm font-semibold text-foreground">
                  {transaction.paymentMethod || "UPI"}
                </span>
              </div>
            </div>
          </div>

          <div className="py-3 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Account</span>
                <span className="text-sm font-semibold text-foreground">
                  {transaction.account?.name || "Default Account"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Category</span>
                <span className="text-sm font-semibold text-foreground">
                  {transaction.category?.name || "General"}
                  {transaction.subcategory?.name && ` (${transaction.subcategory.name})`}
                </span>
              </div>
            </div>
          </div>

          {transaction.notes && (
            <div className="py-3">
              <span className="text-xs text-muted-foreground block mb-1">Notes & Remarks</span>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/60">
                {transaction.notes}
              </p>
            </div>
          )}

          <div className="py-3 text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Created: {formatDate(transaction.createdAt, "dd MMM yyyy, HH:mm")}</span>
            <span>Updated: {formatDate(transaction.updatedAt, "dd MMM yyyy, HH:mm")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
