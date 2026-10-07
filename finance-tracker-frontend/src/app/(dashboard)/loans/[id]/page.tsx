"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  Plus,
  Coins,
  Trash2,
  Edit,
  TrendingDown,
  Calendar,
  Clock,
  Wallet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Percent,
  Receipt,
  Calculator,
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
  useLoan,
  useUpdateLoan,
  useDeactivateLoan,
  useRecordLoanPayment,
  useDeleteLoanPayment,
} from "@/hooks/use-loans";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate, toInputDate } from "@/lib/formatters/date";
import type { LoanPayment, LoanStatus } from "@/types/loan";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LoanDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const loanId = resolvedParams.id;

  const { data: loan, isLoading: isLoanLoading } = useLoan(loanId);
  const { data: accounts } = useAccounts();

  const updateMutation = useUpdateLoan();
  const deactivateMutation = useDeactivateLoan();
  const recordPaymentMutation = useRecordLoanPayment();
  const deletePaymentMutation = useDeleteLoanPayment();

  // Dialog states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<LoanPayment | null>(null);

  // Payment form states
  const [accountId, setAccountId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(toInputDate());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editPrincipal, setEditPrincipal] = useState("");
  const [editInterest, setEditInterest] = useState("");
  const [editEmi, setEditEmi] = useState("");
  const [editTenure, setEditTenure] = useState("");
  const [editStatus, setEditStatus] = useState<LoanStatus>("ACTIVE");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const accountList = (accounts || []).filter((a) => a.isActive);

  const handleOpenEdit = () => {
    if (!loan) return;
    setEditName(loan.name);
    setEditPrincipal(String(loan.principalAmount ?? loan.principal ?? ""));
    setEditInterest(String(loan.interestRate ?? "0"));
    setEditEmi(String(loan.emiAmount ?? loan.monthlyEmi ?? ""));
    setEditTenure(String(loan.tenureMonths ?? "12"));
    setEditStatus((loan.status as LoanStatus) || "ACTIVE");
    setEditDescription(loan.description || "");
    setEditError("");
    setIsEditOpen(true);
  };

  const handleOpenPayment = () => {
    setAccountId(accountList[0]?.id || "");
    const emi = Number(loan?.emiAmount ?? loan?.monthlyEmi ?? 0);
    setPaymentAmount(emi > 0 ? String(emi) : "");
    setPaymentDate(toInputDate());
    setPaymentNotes(`Monthly EMI payment for ${loan?.name}`);
    setPaymentError("");
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    const amt = parseFloat(paymentAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setPaymentError("Please enter a valid payment amount greater than 0");
      return;
    }
    if (!accountId) {
      setPaymentError("Please select a source account");
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        loanId,
        data: {
          accountId,
          amount: amt,
          paymentDate: paymentDate || toInputDate(),
          notes: paymentNotes.trim() || undefined,
        },
      });
      setIsPaymentOpen(false);
    } catch {
      // Handled via toast in hook
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    if (!editName.trim()) {
      setEditError("Loan name is required");
      return;
    }
    const p = parseFloat(editPrincipal);
    if (!p || isNaN(p) || p <= 0) {
      setEditError("Principal must be a positive number");
      return;
    }
    const emi = parseFloat(editEmi);
    if (!emi || isNaN(emi) || emi <= 0) {
      setEditError("EMI amount must be a positive number");
      return;
    }
    const tenure = parseInt(editTenure, 10);
    if (!tenure || isNaN(tenure) || tenure <= 0) {
      setEditError("Tenure must be at least 1 month");
      return;
    }

    const rate = parseFloat(editInterest);

    try {
      await updateMutation.mutateAsync({
        id: loanId,
        data: {
          name: editName.trim(),
          principalAmount: p,
          interestRate: isNaN(rate) ? 0 : rate,
          emiAmount: emi,
          tenureMonths: tenure,
          status: editStatus,
          description: editDescription.trim() || undefined,
        },
      });
      setIsEditOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError("Failed to update loan");
      }
    }
  };

  const handleDeletePayment = async () => {
    if (!deletingPayment) return;
    try {
      await deletePaymentMutation.mutateAsync({
        loanId,
        paymentId: deletingPayment.id,
      });
      setDeletingPayment(null);
    } catch {
      // Handled via toast in hook
    }
  };

  const handleArchive = async () => {
    try {
      await deactivateMutation.mutateAsync(loanId);
      setIsArchiveOpen(false);
      router.push("/loans");
    } catch {
      // Handled via toast in hook
    }
  };

  if (isLoanLoading) {
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

  if (!loan) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Landmark}
          title="Loan Liability Not Found"
          description="The loan record you are looking for does not exist or may have been deleted."
          action={
            <Link href="/loans">
              <Button size="sm">Back to Loans</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const principal = Number(loan.principalAmount ?? loan.principal ?? 0);
  const paid = Number(loan.paidAmount ?? 0);
  const remaining = Number(
    loan.remainingPrincipal ?? loan.remainingBalance ?? Math.max(0, principal - paid)
  );
  const emi = Number(loan.emiAmount ?? loan.monthlyEmi ?? 0);
  const interest = Number(loan.interestRate ?? 0);
  const payoffPct = principal > 0 ? Math.min(Math.round((paid / principal) * 100), 100) : 0;
  const isCompleted = loan.status === "COMPLETED" || remaining <= 0;

  const payments = loan.payments || [];
  const paymentsCount = payments.length;
  const totalContractCost = emi * loan.tenureMonths;
  const estimatedTotalInterest = Math.max(0, totalContractCost - principal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={loan.name}
        description={loan.description || "Amortization progress and historical installment payments"}
      >
        <div className="flex items-center gap-2">
          <Link href="/loans">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> All Loans
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
          {loan.status === "ACTIVE" && !isCompleted && (
            <Button
              size="sm"
              className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleOpenPayment}
            >
              <Plus className="h-4 w-4" /> Record EMI Payment
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Remaining Debt</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(remaining)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isCompleted ? "Fully Paid Off!" : "Outstanding principal balance"}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Monthly Installment (EMI)</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(emi)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scheduled monthly payment
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Repaid to Date</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(paid)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {paymentsCount} payments made ({payoffPct}% principal)
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Loan Status</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <Badge
              variant={isCompleted ? "default" : "outline"}
              className={`text-xs py-0.5 ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "border-primary text-primary"
              }`}
            >
              {isCompleted ? "COMPLETED" : loan.status}
            </Badge>
            <p className="text-[11px] text-muted-foreground mt-1">
              {interest > 0 ? `${interest}% p.a. interest` : "0% interest loan"}
            </p>
          </div>
        </Card>
      </div>

      {/* Amortization Progress Visualizer */}
      <Card className="p-6 border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Principal Payoff Gauge</h3>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paid)} paid of {formatCurrency(principal)} principal
            </p>
          </div>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {payoffPct}%
          </span>
        </div>

        <div className="space-y-2">
          <Progress
            value={payoffPct}
            variant={isCompleted ? "success" : "default"}
            className="h-3"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
            <span>₹0 (0%)</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>{formatCurrency(principal)} (100%)</span>
          </div>
        </div>

        {/* Loan Term Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-border">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Tenure
            </span>
            <span className="font-semibold text-foreground">{loan.tenureMonths} Months</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Total Contract Outflow
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(totalContractCost)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Estimated Total Interest
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(estimatedTotalInterest)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Start Date
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(loan.startDate, "dd MMM yyyy")}
            </span>
          </div>
        </div>
      </Card>

      {/* Description / Strategy notes */}
      {loan.description && (
        <Card className="p-4 bg-muted/20 border-border space-y-1">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" /> Loan Agreement & Notes
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">{loan.description}</p>
        </Card>
      )}

      {/* Historical Payments Ledger */}
      <Card className="border-border overflow-hidden bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Installment Repayment History</CardTitle>
            <CardDescription className="text-xs">
              Every EMI installment paid toward this loan obligation
            </CardDescription>
          </div>
          {loan.status === "ACTIVE" && !isCompleted && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8"
              onClick={handleOpenPayment}
            >
              <Plus className="h-3.5 w-3.5" /> Log Payment
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                title="No EMI payments recorded yet"
                description="Record your first EMI payment to start reducing your outstanding debt balance."
                action={
                  <Button size="sm" className="gap-2" onClick={handleOpenPayment}>
                    <Plus className="h-4 w-4" /> Record First Payment
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Source Account</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-xs font-medium whitespace-nowrap">
                        {formatDate(payment.paymentDate, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {payment.account?.name || "Bank Account"}
                          </span>
                          {payment.account?.accountType && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                              {payment.account.accountType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {payment.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingPayment(payment)}
                          title="Delete payment record"
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
          <h4 className="text-xs font-semibold text-destructive">Archive This Loan</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Archiving removes this liability from active repayment schedules. Historical payment
            transactions remain intact.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs shrink-0"
          onClick={() => setIsArchiveOpen(true)}
        >
          Archive Loan
        </Button>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" />
              <span>Record EMI Payment for {loan.name}</span>
            </DialogTitle>
            <DialogDescription>
              Record an installment payment. This will debit your selected bank account and reduce
              outstanding loan principal balance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {paymentError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{paymentError}</span>
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
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 5000"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />

            <Input
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="e.g. Monthly installment paid via NetBanking"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
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
                isLoading={recordPaymentMutation.isPending}
              >
                Confirm EMI Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Loan Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" /> Edit Loan Liability
            </DialogTitle>
            <DialogDescription>
              Update your loan specifications, monthly EMI amount, or status.
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
              label="Loan Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Principal Amount (₹)"
                type="number"
                step="0.01"
                min="1"
                value={editPrincipal}
                onChange={(e) => setEditPrincipal(e.target.value)}
                required
              />

              <Input
                label="Monthly EMI (₹)"
                type="number"
                step="0.01"
                min="1"
                value={editEmi}
                onChange={(e) => setEditEmi(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Interest Rate (%)"
                type="number"
                step="0.01"
                min="0"
                value={editInterest}
                onChange={(e) => setEditInterest(e.target.value)}
              />

              <Input
                label="Tenure (Months)"
                type="number"
                min="1"
                value={editTenure}
                onChange={(e) => setEditTenure(e.target.value)}
                required
              />

              <Select
                label="Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as LoanStatus)}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "COMPLETED", label: "Completed" },
                ]}
              />
            </div>

            <Textarea
              label="Description / Account Notes"
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

      {/* Delete Payment Confirmation */}
      <Dialog
        open={Boolean(deletingPayment)}
        onOpenChange={(open) => {
          if (!open) setDeletingPayment(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Payment Record?</DialogTitle>
            <DialogDescription>
              This will remove this {formatCurrency(deletingPayment?.amount)} EMI installment and
              revert the corresponding debit transaction back into your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeletePayment}
              isLoading={deletePaymentMutation.isPending}
            >
              Delete & Revert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Loan Confirmation */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive {loan.name}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this loan? It will no longer appear in your active
              liabilities overview.
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
