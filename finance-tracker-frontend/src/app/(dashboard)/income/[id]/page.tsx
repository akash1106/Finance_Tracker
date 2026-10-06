"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Calendar, Building, Briefcase, Sparkles } from "lucide-react";
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
import { incomeApi } from "@/lib/api/income.api";
import { queryKeys } from "@/lib/query/query-keys";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { toast } from "sonner";

export default function IncomeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const [isDeleting, setIsDeleting] = useState(false);

  const { data: income, isLoading, isError } = useQuery({
    queryKey: queryKeys.income.detail(id),
    queryFn: () => incomeApi.getById(id),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
      toast.success("Income record removed");
      router.push("/income");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove income record");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !income) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Income Record Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested record could not be retrieved or has been deleted.
        </p>
        <Link href="/income">
          <Button variant="outline">Back to Income History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/income"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to income
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
        title={income.description || income.incomeSource?.name || "Income Record"}
        description={`Transaction receipt ID: ${income.id}`}
      />

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border bg-emerald-500/5 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Credited Inflow Voucher
            </span>
            <Badge variant={income.incomeSource?.isSalary ? "default" : "secondary"}>
              {income.incomeSource?.isSalary ? "Salary Credit" : "Other Income"}
            </Badge>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(income.amount)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border pt-2">
          <div className="py-3 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Received Date</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(income.receivedDate, "dd MMMM yyyy")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Income Source</span>
                <span className="text-sm font-semibold text-foreground">
                  {income.incomeSource?.name || "Income"}
                </span>
              </div>
            </div>
          </div>

          <div className="py-3 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Deposit Account</span>
                <span className="text-sm font-semibold text-foreground">
                  {income.account?.name || "Default Account"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Classification</span>
                <span className="text-sm font-semibold text-foreground">
                  {income.incomeSource?.isSalary ? "Salary Earnings" : "Variable Inflow"}
                </span>
              </div>
            </div>
          </div>

          {income.description && (
            <div className="py-3">
              <span className="text-xs text-muted-foreground block mb-1">Description</span>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/60">
                {income.description}
              </p>
            </div>
          )}

          {income.notes && (
            <div className="py-3">
              <span className="text-xs text-muted-foreground block mb-1">Notes</span>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/60">
                {income.notes}
              </p>
            </div>
          )}

          <div className="py-3 text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Created: {formatDate(income.createdAt, "dd MMM yyyy, HH:mm")}</span>
            <span>Updated: {formatDate(income.updatedAt, "dd MMM yyyy, HH:mm")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Income Record?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? Account balances will update accordingly.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
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
