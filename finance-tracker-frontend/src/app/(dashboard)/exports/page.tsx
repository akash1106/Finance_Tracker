"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Database,
  Layers,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import { exportsApi } from "@/lib/api/exports.api";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ExportsCenterPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  // Transaction export state
  const [txFormat, setTxFormat] = useState<"CSV" | "XLSX">("CSV");
  const [txFromDate, setTxFromDate] = useState<string>("");
  const [txToDate, setTxToDate] = useState<string>("");
  const [isExportingTx, setIsExportingTx] = useState(false);

  // Monthly report export state
  const [monthlyYear, setMonthlyYear] = useState<number>(currentYear);
  const [monthlyMonth, setMonthlyMonth] = useState<number>(now.getMonth() + 1);
  const [isExportingMonthly, setIsExportingMonthly] = useState(false);

  // Yearly report export state
  const [yearlyYear, setYearlyYear] = useState<number>(currentYear);
  const [isExportingYearly, setIsExportingYearly] = useState(false);

  const handleExportTransactions = async () => {
    try {
      setIsExportingTx(true);
      await exportsApi.downloadTransactions({
        format: txFormat,
        from: txFromDate || undefined,
        to: txToDate || undefined,
      });
      toast.success(`Transactions exported as ${txFormat} successfully`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to export transactions");
    } finally {
      setIsExportingTx(false);
    }
  };

  const handleExportMonthly = async () => {
    try {
      setIsExportingMonthly(true);
      await exportsApi.downloadMonthlyReport({
        year: monthlyYear,
        month: monthlyMonth,
      });
      toast.success(`Monthly financial statement for ${MONTH_NAMES[monthlyMonth - 1]} ${monthlyYear} downloaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to export monthly report");
    } finally {
      setIsExportingMonthly(false);
    }
  };

  const handleExportYearly = async () => {
    try {
      setIsExportingYearly(true);
      await exportsApi.downloadYearlyReport({
        year: yearlyYear,
      });
      toast.success(`Yearly financial report for ${yearlyYear} downloaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to export yearly report");
    } finally {
      setIsExportingYearly(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Center & Archival Hub"
        description="Download your complete transaction ledger and structured audit statements in CSV, Excel (XLSX), and PDF formats"
      >
        <Link href="/reports">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <FileText className="h-4 w-4" /> Reports Center
          </Button>
        </Link>
      </PageHeader>

      {/* Security & Data Assurance Card */}
      <Card className="border-border bg-card/60">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Secure Client-Side Delivery</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                All exports are streamed over SSL and formatted according to international double-entry ledger standards.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30 shrink-0">
            Encrypted & Compliant
          </Badge>
        </CardContent>
      </Card>

      {/* 3 Main Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export 1: Transactions Ledger */}
        <Card className="bg-card border-border flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold">Transactions Ledger</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Raw double-entry transaction database containing amounts, dates, accounts, categories, and memo tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">File Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxFormat("CSV")}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      txFormat === "CSV"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    CSV (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFormat("XLSX")}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      txFormat === "XLSX"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Excel (.xlsx)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Date Range (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">From</span>
                    <Input
                      type="date"
                      value={txFromDate}
                      onChange={(e) => setTxFromDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">To</span>
                    <Input
                      type="date"
                      value={txToDate}
                      onChange={(e) => setTxToDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Includes all deposit, withdrawal, and saving records</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Compatible with Microsoft Excel, Sheets, and QuickBooks</span>
                </div>
              </div>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Button
              variant="primary"
              className="w-full gap-2 text-xs"
              disabled={isExportingTx}
              onClick={handleExportTransactions}
            >
              <Download className="h-4 w-4" />
              {isExportingTx ? "Generating Export..." : `Download ${txFormat}`}
            </Button>
          </div>
        </Card>

        {/* Export 2: Monthly Financial Statement */}
        <Card className="bg-card border-border flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold">Monthly Financial Statement</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Executive PDF report summarizing monthly income, expenditures, savings rate, and net capital flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Select Month</label>
                <Select
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                  className="h-9 text-xs"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Select Year</label>
                <Select
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(Number(e.target.value))}
                  className="h-9 text-xs"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Structured executive statement layout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Includes income vs expense net surplus calculation</span>
                </div>
              </div>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs border-sky-500/30 text-sky-500 hover:bg-sky-500/10"
              disabled={isExportingMonthly}
              onClick={handleExportMonthly}
            >
              <Download className="h-4 w-4" />
              {isExportingMonthly ? "Generating PDF..." : "Download Monthly PDF"}
            </Button>
          </div>
        </Card>

        {/* Export 3: Yearly Audit Statement */}
        <Card className="bg-card border-border flex flex-col justify-between">
          <div>
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold">Yearly Financial Audit</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Comprehensive 12-month consolidated financial statement for personal records, tax filing, and annual review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Select Audit Year</label>
                <Select
                  value={yearlyYear}
                  onChange={(e) => setYearlyYear(Number(e.target.value))}
                  className="h-9 text-xs"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Consolidated 12-month cash flow overview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Includes annual capital deployment breakdown</span>
                </div>
              </div>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
              disabled={isExportingYearly}
              onClick={handleExportYearly}
            >
              <Download className="h-4 w-4" />
              {isExportingYearly ? "Generating PDF..." : "Download Annual PDF"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
